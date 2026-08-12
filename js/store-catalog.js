/**
 * SoleFit Store Catalog Data
 * Contains 3D model specs, sizing chart mappings, and footwear metadata.
 */

window.SoleFitCatalog = [
  {
    id: 'aero-stride-nitro',
    name: 'AeroStride Nitro 3D',
    category: 'Next-Gen Performance Runner',
    price: 159.00,
    rating: 4.9,
    reviews: 142,
    description: 'Engineered for responsive cushioning with carbon-fiber spring plate technology and breathable matrix mesh upper.',
    colors: [
      { name: 'Neon Cyber', hex: '#6366f1', secondary: '#06b6d4' },
      { name: 'Phantom Black', hex: '#1e293b', secondary: '#475569' },
      { name: 'Volt Emerald', hex: '#10b981', secondary: '#06b6d4' }
    ],
    sizeChart: [
      { US: 7.0, UK: 6.0, EU: 40, lengthMinCm: 24.5, lengthMaxCm: 25.1, widthCm: 9.2 },
      { US: 8.0, UK: 7.0, EU: 41, lengthMinCm: 25.2, lengthMaxCm: 25.8, widthCm: 9.5 },
      { US: 8.5, UK: 7.5, EU: 42, lengthMinCm: 25.9, lengthMaxCm: 26.4, widthCm: 9.7 },
      { US: 9.0, UK: 8.0, EU: 42.5, lengthMinCm: 26.5, lengthMaxCm: 27.0, widthCm: 9.9 },
      { US: 9.5, UK: 8.5, EU: 43, lengthMinCm: 27.1, lengthMaxCm: 27.5, widthCm: 10.1 },
      { US: 10.0, UK: 9.0, EU: 44, lengthMinCm: 27.6, lengthMaxCm: 28.1, widthCm: 10.3 },
      { US: 11.0, UK: 10.0, EU: 45, lengthMinCm: 28.2, lengthMaxCm: 29.0, widthCm: 10.6 }
    ],
    model3dSpecs: {
      type: 'procedural-sneaker',
      soleColor: '#ffffff',
      upperColor: '#6366f1',
      accentColor: '#06b6d4',
      scale: { x: 1, y: 1, z: 1.2 }
    }
  },
  {
    id: 'quantum-flux-boost',
    name: 'Quantum Flux High-Top',
    category: 'Urban Lifestyle / Streetwear',
    price: 189.00,
    rating: 4.8,
    reviews: 98,
    description: 'High-top silhouette featuring adaptive heel lock, memory foam midsole, and weather-resistant recycled canvas.',
    colors: [
      { name: 'Solar Crimson', hex: '#ec4899', secondary: '#f59e0b' },
      { name: 'Midnight Onyx', hex: '#0f172a', secondary: '#334155' }
    ],
    sizeChart: [
      { US: 7.5, UK: 6.5, EU: 40.5, lengthMinCm: 24.8, lengthMaxCm: 25.4, widthCm: 9.4 },
      { US: 8.5, UK: 7.5, EU: 42, lengthMinCm: 25.7, lengthMaxCm: 26.3, widthCm: 9.8 },
      { US: 9.5, UK: 8.5, EU: 43, lengthMinCm: 26.8, lengthMaxCm: 27.4, widthCm: 10.2 },
      { US: 10.5, UK: 9.5, EU: 44.5, lengthMinCm: 27.7, lengthMaxCm: 28.3, widthCm: 10.5 }
    ],
    model3dSpecs: {
      type: 'procedural-hightop',
      soleColor: '#0f172a',
      upperColor: '#ec4899',
      accentColor: '#f59e0b',
      scale: { x: 1.05, y: 1.1, z: 1.25 }
    }
  },
  {
    id: 'urban-trek-boot',
    name: 'Vanguard All-Terrain Boot',
    category: 'Outdoor / Trail Explorer',
    price: 210.00,
    rating: 5.0,
    reviews: 64,
    description: 'Heavy-duty lugged outsole with waterproof inner bootie and shock-absorbing dual-density footbed.',
    colors: [
      { name: 'Desert Ochre', hex: '#d97706', secondary: '#78350f' },
      { name: 'Alpine Slate', hex: '#475569', secondary: '#0f172a' }
    ],
    sizeChart: [
      { US: 8.0, UK: 7.0, EU: 41, lengthMinCm: 25.1, lengthMaxCm: 25.7, widthCm: 9.6 },
      { US: 9.0, UK: 8.0, EU: 42.5, lengthMinCm: 26.2, lengthMaxCm: 26.9, widthCm: 10.0 },
      { US: 10.0, UK: 9.0, EU: 44, lengthMinCm: 27.2, lengthMaxCm: 27.9, widthCm: 10.4 },
      { US: 11.0, UK: 10.0, EU: 45, lengthMinCm: 28.1, lengthMaxCm: 28.9, widthCm: 10.7 }
    ],
    model3dSpecs: {
      type: 'procedural-boot',
      soleColor: '#78350f',
      upperColor: '#d97706',
      accentColor: '#f59e0b',
      scale: { x: 1.1, y: 1.15, z: 1.3 }
    }
  }
];
