# DJJ Signing Platform

Static signing website packaged as a lightweight multi-file app.

## Structure

- `index.html` - lightweight redirect for static hosts.
- `app/index.html` - browser entrypoint for the signing app.
- `app/*.jsx` - readable client-side modules loaded by Babel in the browser.
- `djjlogo.png` - shared logo asset used by the UI and PDF generation.

## Run Locally

Serve the folder with any static web server, then open the local URL or the app entrypoint directly:

```powershell
python -m http.server 8000
```

Open `/` or `/app/index.html`.

The site depends on CDN-hosted React, Babel, jsPDF, html2canvas, and Google Fonts.

## Integrations

- URL prefill: open `#/delivery` and pass delivery fields through query parameters. Supported keys include `invoice_no`, `invoice_date`, `sales_rep`, `customer_name`, `customer_abn`, `delivery_address`, `delivery_contact`, `delivery_phone`, `delivery_email`, `transport_company`, `transport_contact`, `transport_phone`, and `transport_email`.
- Delivery line items: pass `delivery_items` or `items` as URL-encoded JSON, for example an array of objects containing `description`, `model`, `serial` or `vin`, and `quantity`.
- Driver handoff link: the Delivery Order page includes a copy-link action that preserves the current prefilled delivery data and routes directly to `#/delivery`, leaving only driver name, phone, vehicle rego, and signature for manual completion.
- Lark host fill: call `window.LarkFill({...})` from the embedding host, or send `{ type: 'lark:fill', payload: {...} }` to the app frame with the same field names.
- Signed PDF automation hook: the browser still downloads the PDF locally. For Delivery Orders, the app also calls `window.DeliveryOrderMailer.send(payload)` when that bridge exists, or posts `{ type: 'delivery-order:ready-to-email', payload }` to the parent frame.
- Email target: delivery-order automation payloads are prepared for `anita@djjequipment.com.au`. Actual Gmail search, booking-confirmation extraction, and automatic email sending need to be handled by the connected Gmail/Lark automation layer or a backend service outside this static page.
- After any signing flow completes, embedded hosts also receive `{ type: 'signed', kind, filename, fields }`.
