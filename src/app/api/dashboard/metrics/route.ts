// src/app/api/dashboard/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

export async function GET(request: NextRequest) {
  try {
    console.log('Starting BigQuery request...');

    // Verify credentials
    if (!process.env.GOOGLE_CLOUD_PRIVATE_KEY || !process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
      throw new Error('Missing GCP credentials');
    }

    // Overall Metrics Query
    const metricsQuery = `
      WITH LinkStats AS (
        SELECT COUNT(*) as total_links
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.link_generator.link_created_events\`
      ),
      OrderStats AS (
        SELECT 
          COUNT(DISTINCT orderId) as total_orders,
          AVG(totalAmount)/100 as avg_order_value,
          SUM(totalAmount)/100 as total_revenue,
          AVG(timeToConversion) as avg_time_to_conversion
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.link_generator.order_conversions\`
      )
      SELECT 
        l.total_links,
        o.total_orders,
        o.avg_order_value,
        o.total_revenue,
        o.avg_time_to_conversion
      FROM LinkStats l, OrderStats o
    `;

    // Time Series Query for Conversions Over Time
    const timeSeriesQuery = `
      WITH daily_metrics AS (
        SELECT
          DATE(l.createdAt) as date,
          COUNT(l.linkId) as links_created,
          COUNT(DISTINCT o.orderId) as orders
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.link_generator.link_created_events\` l
        LEFT JOIN \`${process.env.GOOGLE_CLOUD_PROJECT}.link_generator.order_conversions\` o
        ON l.linkId = o.linkId
        GROUP BY date
        ORDER BY date DESC
        LIMIT 50
      )
      SELECT * FROM daily_metrics ORDER BY date ASC
    `;

    // Top Products Query
    const productsQuery = `
      SELECT 
        p.name,
        COUNT(DISTINCT o.orderId) as order_count,
        SUM(p.quantity) as total_quantity,
        SUM(p.price * p.quantity)/100 as total_revenue
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.link_generator.order_conversions\` o,
      UNNEST(products) as p
      GROUP BY p.name
      ORDER BY order_count DESC
      LIMIT 20
    `;

    // Cart Conversion Flow Query
    const conversionFlowQuery = `
      WITH CartData AS (
        SELECT 
          l.linkId,
          CASE 
            WHEN o.orderId IS NOT NULL THEN 'Converted'
            ELSE 'Not Converted'
          END as status
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.link_generator.link_created_events\` l
        LEFT JOIN \`${process.env.GOOGLE_CLOUD_PROJECT}.link_generator.order_conversions\` o
        ON l.linkId = o.linkId
      )
      SELECT 
        status,
        COUNT(*) as count
      FROM CartData
      GROUP BY status
    `;

    const cartHistoryQuery = `
  SELECT 
    l.linkId,
    l.createdAt,
    l.customerEmail,
    l.totalAmount/100 as cartValue,
    o.orderId IS NOT NULL as isConverted,
    TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), l.createdAt, HOUR) as hoursAge,
    l.discountCode,
    CASE 
      WHEN l.directDiscount.type = 'absolute' THEN l.directDiscount.value
      WHEN l.directDiscount.type = 'relative' THEN (l.totalAmount * l.directDiscount.value / 10000)
      ELSE 0
    END as discountValue,
    TIMESTAMP_DIFF(o.createdAt, l.createdAt, MINUTE) as conversionTimeMinutes
  FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.link_generator.link_created_events\` l
  LEFT JOIN \`${process.env.GOOGLE_CLOUD_PROJECT}.link_generator.order_conversions\` o
  ON l.linkId = o.linkId
  ORDER BY l.createdAt DESC
  LIMIT 50
`;


  const discountAnalysisQuery = `
  WITH DiscountStats AS (
    SELECT 
      CASE
        WHEN discountCode IS NOT NULL THEN 'Discount Code'
        WHEN directDiscount IS NOT NULL THEN 
          CONCAT('Direct Discount (', directDiscount.type, ')')
        ELSE 'No Discount'
      END as discountCategory,
      CASE 
        WHEN directDiscount.type = 'absolute' THEN directDiscount.value
        WHEN directDiscount.type = 'relative' THEN (totalAmount * (directDiscount.value / 10000))
        WHEN discountCode IS NOT NULL THEN totalAmount * 0.1  -- Assuming 10% for discount codes
        ELSE 0
      END as discountValue
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.link_generator.link_created_events\`
  )
  SELECT 
    discountCategory,
    COUNT(*) as count,
    AVG(discountValue) as averageDiscount,
    SUM(discountValue) as totalDiscount
  FROM DiscountStats
  GROUP BY discountCategory
  ORDER BY count DESC
`;

    // Execute all queries
    const [metricsRows] = await bigquery.query(metricsQuery);
    const [timeSeriesRows] = await bigquery.query(timeSeriesQuery);
    const [productRows] = await bigquery.query(productsQuery);
    const [conversionFlowRows] = await bigquery.query(conversionFlowQuery);
    const [cartHistoryRows] = await bigquery.query(cartHistoryQuery);
    const [discountAnalysisRows] = await bigquery.query(discountAnalysisQuery);



    // Format metrics data
    const metrics = {
      totalLinks: metricsRows[0].total_links,
      totalOrders: metricsRows[0].total_orders,
      conversionRate: (metricsRows[0].total_orders / metricsRows[0].total_links) * 100,
      averageOrderValue: metricsRows[0].avg_order_value,
      totalRevenue: metricsRows[0].total_revenue,
      averageTimeToConversion: metricsRows[0].avg_time_to_conversion
    };

    // Format time series data
    const timeSeriesData = {
      dates: timeSeriesRows.map(row => row.date.value),
      links: timeSeriesRows.map(row => row.links_created),
      conversions: timeSeriesRows.map(row => row.orders)
    };

    // Format products data
    const productsData = productRows.map(row => ({
      name: row.name,
      orders: row.order_count,
      quantity: row.total_quantity,
      revenue: row.total_revenue
    }));

    // Format conversion flow data
    const conversionFlowData = conversionFlowRows.reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {});

    // Format cart history data
const cartHistory = cartHistoryRows.map(row => ({
    linkId: row.linkId,
    createdAt: row.createdAt.value,
    cartValue: row.cartValue,
    customerEmail: row.customerEmail,
    isConverted: row.isConverted,
    discountCode: row.discountCode,
    discountValue: row.discountValue,
    hoursAge: row.hoursAge,
    conversionTimeMinutes: row.conversionTimeMinutes
  }));

  // Format discount analysis data
  const discountAnalysis = discountAnalysisRows.map(row => ({
    discountCategory: row.discountCategory,
    count: row.count,
    averageDiscount: Number((row.averageDiscount).toFixed(2)),
    totalDiscount: Number((row.totalDiscount).toFixed(2))
  }));

    return NextResponse.json({
      metrics,
      timeSeriesData,
      productsData,
      conversionFlowData,
      cartHistory,
      discountAnalysis
    });

  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}