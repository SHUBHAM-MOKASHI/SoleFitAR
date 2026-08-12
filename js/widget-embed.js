/**
 * SoleFit D2C Widget Integration & Embed Generator
 * Generates script tags and provides live widget customization preview for retailers.
 */

class WidgetEmbed {
  constructor() {
    this.config = {
      storeId: 'STRIDE-9021',
      theme: 'dark',
      buttonStyle: 'gradient',
      buttonText: '⚡ Try On in AR (No App)',
      accentColor: '#6366f1',
      position: 'inline',
      language: 'en'
    };
  }

  /**
   * Generates production-ready single line script snippet
   */
  generateEmbedCode() {
    return `<!-- SoleFit WebAR Footwear Try-On Plugin -->
<script src="https://cdn.solefit.ar/v1/widget.js" 
  data-store-id="${this.config.storeId}"
  data-theme="${this.config.theme}"
  data-accent="${this.config.accentColor}"
  data-style="${this.config.buttonStyle}"
  async>
</script>

<div id="solefit-ar-widget" 
  data-product-sku="AERO-NITRO-01" 
  data-button-text="${this.config.buttonText}">
</div>`;
  }

  /**
   * Generates Shopify liquid code snippet
   */
  generateShopifyCode() {
    return `{% comment %} SoleFit WebAR Plugin for Shopify liquid {% endcomment %}
{{ 'solefit-ar.css' | asset_url | stylesheet_tag }}
<script src="https://cdn.solefit.ar/shopify/v1/solefit-shopify.js" defer></script>

{% render 'solefit-tryon-button', product: product, theme: '${this.config.theme}' %}`;
  }

  /**
   * Updates configuration & refreshes live widget preview
   */
  updateConfig(key, value) {
    this.config[key] = value;
    this.renderLivePreview();
  }

  /**
   * Renders the live interactive widget preview in the retailer portal
   */
  renderLivePreview() {
    const previewContainer = document.getElementById('mockWidgetPreview');
    const codeBlock = document.getElementById('embedCodeOutput');

    if (codeBlock) {
      codeBlock.textContent = this.generateEmbedCode();
    }

    if (previewContainer) {
      let buttonBg = 'linear-gradient(135deg, var(--primary), #4338ca)';
      if (this.config.buttonStyle === 'solid') buttonBg = this.config.accentColor;
      if (this.config.buttonStyle === 'dark') buttonBg = '#0f172a';
      if (this.config.buttonStyle === 'glass') buttonBg = 'rgba(255, 255, 255, 0.1)';

      previewContainer.innerHTML = `
        <button class="btn-ar-tryon" style="background: ${buttonBg}; border-color: ${this.config.accentColor};" onclick="window.SoleFitApp.openARModal()">
          ${this.config.buttonText}
        </button>
      `;
    }
  }
}

window.WidgetEmbed = new WidgetEmbed();
