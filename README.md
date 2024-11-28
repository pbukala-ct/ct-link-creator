# Commercetools Link Generator

A Next.js application that allows business users to generate sharable cart links and QR codes for commercetools projects. The generated links and QR codes can be shared with customers to access pre-configured carts with specific products, shipping methods, and customer details.

## Features

- **Cart Configuration**
  - Select products from the commercetools catalog
  - Choose shipping method
  - Set currency (automatically sets appropriate country)
  - Assign customer from existing customers list
  
- **Link Generation**
  - Creates a unique cart in commercetools
  - Generates a shareable link
  - Creates and stores QR code in Google Cloud Storage
  - Provides both cart view and direct checkout options

- **Cart Display**
  - Modern, responsive cart view
  - Shows selected products with quantities and prices
  - Displays shipping information and tax details
  - Shows customer information when assigned
  - Includes QR code for easy sharing

## Tech Stack

- **Frontend**
  - Next.js 13+ with App Router
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components
  - QR Code generation using `qrcode`

- **Backend**
  - Next.js API Routes
  - Commercetools SDK
  - Google Cloud Storage for QR code storage

- **Integrations**
  - Commercetools Platform API
  - Google Cloud Platform (Storage)

## Prerequisites

- Node.js >= 18.18.0
- Commercetools project with:
  - API client credentials
  - Custom type for cart links
- Google Cloud Platform project with:
  - Storage bucket
  - Service account with appropriate permissions

## Environment Variables

Create a `.env.local` file with:

```env
# Commercetools Configuration
CTP_PROJECT_KEY=your-project-key
CTP_CLIENT_ID=your-client-id
CTP_CLIENT_SECRET=your-client-secret
CTP_API_URL=https://api.[region].commercetools.com
CTP_AUTH_URL=https://auth.[region].commercetools.com
CTP_SCOPE=manage_project:your-project-key

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account-email
GOOGLE_CLOUD_PRIVATE_KEY=your-private-key
GOOGLE_CLOUD_BUCKET_NAME=your-bucket-name

# Application Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000 # Or your production URL
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create required custom type in commercetools:
```json
{
  "key": "link-cart-type",
  "name": {
    "en": "Link Cart Type"
  },
  "description": {
    "en": "Type for storing link information on carts"
  },
  "resourceTypeIds": ["cart"],
  "fieldDefinitions": [
    {
      "name": "linkId",
      "type": { "name": "String" },
      "required": true,
      "label": { "en": "Link ID" }
    },
    {
      "name": "createdAt",
      "type": { "name": "DateTime" },
      "required": true,
      "label": { "en": "Created At" }
    },
    {
      "name": "qrCodeUrl",
      "type": { "name": "String" },
      "required": false,
      "label": { "en": "QR Code URL" }
    }
  ]
}
```

3. Configure Google Cloud Storage:
   - Create a bucket
   - Set up CORS configuration
   - Configure public access
   - Create service account with necessary permissions

4. Run the development server:
```bash
npm run dev
```

## Usage

1. Access the application and log in
2. Select products from the dropdown
3. Choose currency and shipping method
4. Select a customer (optional)
5. Generate the link
6. Use the generated link or QR code to share the cart

## Deployment

The application can be deployed to any platform that supports Next.js applications. For Netlify deployment:

1. Configure environment variables in Netlify dashboard
2. Set the correct `NEXT_PUBLIC_BASE_URL` for production
3. Deploy using the Netlify CLI or GitHub integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
