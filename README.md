# Project 9: L'Oréal Smart Routine & Product Advisor

L'Oréal is expanding what's possible with AI, and now your chatbot is getting smarter. This week, you'll upgrade it into a **product-aware routine builder chatbot** that helps customers navigate L'Oréal's extensive product catalog and receive tailored recommendations powered by the OpenAI API.

Users will be able to browse real L'Oréal brand products, select the ones they want, and generate a personalized routine using AI. They can also ask follow-up questions about their routine—just like chatting with a real advisor.

## 🎨 Features

- **Browse L'Oréal Products**: Filter products by category (cleansers, moisturizers, skincare, haircare, makeup, and more)
- **Product Search**: Search for products by name or keyword to quickly find what you need
- **Smart Selection**: Click to select/unselect products with visual feedback
- **AI-Powered Routine Generation**: Generate personalized skincare, haircare, and beauty routines using OpenAI's GPT-4o model
- **Conversational Chat**: Ask follow-up questions about your generated routine with full conversation history
- **Persistent Storage**: Your selected products are saved locally, surviving page reloads
- **Responsive Design**: Beautiful, mobile-friendly interface with L'Oréal brand styling
- **RTL Language Support**: Support for right-to-left language layouts

## 🚀 Live Demo

Visit the live application: [L'Oréal Smart Routine & Product Advisor](https://diazdizazter.github.io/09-prj-loreal-routine-builder/)

## 🛠️ Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- OpenAI API key (for the backend Cloudflare Worker)

### Installation

1. Clone the repository

```bash
git clone https://github.com/GCA-Classroom/09-prj-loreal-routine-builder.git
cd 09-prj-loreal-routine-builder
```

2. Open `index.html` in your browser or serve locally

```bash
python -m http.server 8000
# Then visit http://localhost:8000
```

## 🎯 Core Functionality

### Product Selection

- Browse products organized by category
- Click product cards to select/unselect items
- Visual indicators show selected products
- Manage selections in the "Selected Products" section

### Routine Generation

- Select products you want to use
- Click "Generate Routine" to send product data to OpenAI
- Receive a personalized routine based on your selections
- All responses are generated using OpenAI's GPT-4o model

### Chat Interface

- Ask questions about your generated routine
- Get skincare, haircare, makeup, fragrance advice
- Full conversation history is maintained
- Chat is powered by Cloudflare Worker for secure API handling

## 🎨 Design & Branding

The application uses L'Oréal's distinctive visual identity:

- **Brand Colors**: Red (#ff003b) and Gold (#e3a535)
- **Typography**: Roman serif font (elegant, sophisticated) with geometric sans-serif accents
- **Visual Style**: Clean, modern interface with subtle gold shadows on interactive elements
- **Accessibility**: Keyboard navigation, focus states, and semantic HTML

## 🔧 Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **API**: OpenAI GPT-4o via Cloudflare Worker
- **Data**: JSON product database with real L'Oréal brands (CeraVe, L'Oréal Paris, Garnier, Lancôme, etc.)
- **Storage**: Local Storage API for persistence

## 📁 Project Structure

```
09-prj-loreal-routine-builder/
├── index.html          # Main HTML structure
├── style.css           # Styling and design
├── script.js           # Functionality logic
├── products.json       # L'Oréal product database
├── img/                # Brand assets (logos, etc.)
└── README.md          # This file
```

## 📝 Extra Credit Features (Optional)

- **Web Search Integration** (10 pts): Real-time web search capability with citations
- **Advanced Product Search** (10 pts): Enhanced filtering with autocomplete
- **RTL Language Support** (5 pts): Full right-to-left layout support

## 🤝 Contributing

Feel free to fork this repository and submit pull requests for improvements!

## 📄 License

This project is developed for educational purposes. L'Oréal is a registered trademark of L'Oréal S.A.
