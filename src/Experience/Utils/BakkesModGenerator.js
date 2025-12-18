// src/Experience/Utils/BakkesModGenerator.js
// Générateur de codes BakkesMod pour Rocket League

// ===== PAINTS =====
export const PAINT = {
    NONE: 0,
    CRIMSON: 1,
    LIME: 2,
    BLACK: 3,
    SKYBLUE: 4,
    COBALT: 5,
    BURNTSIENNA: 6,
    FORESTGREEN: 7,
    PURPLE: 8,
    PINK: 9,
    ORANGE: 10,
    GREY: 11,
    TITANIUMWHITE: 12,
    SAFFRON: 13,
    GOLD: 14,
    ROSEGOLD: 15,
    WHITEGOLD: 16,
    ONYX: 17,
    PLATINUM: 18
};

// ===== BODIES (Voitures) =====
export const BODY = {
    octane: 23,
    fennec: 4284,
    dominus: 403,
};

// ===== DECALS (Textures) - À AJUSTER AVEC LES VRAIS IDs =====
export const DECAL = {
    NONE: 0,
    // Fennec presets
    fennecPreset1: 10066,
    fennecPreset2: 10067,
    fennecPreset3: 10068,
    fennecPreset4: 10069,
    // Octane presets
    octanePreset1: 8375,
    octanePreset2: 8376,
    octanePreset3: 8377,
    octanePreset4: 8378,
    // Dominus presets
    dominusPreset1: 9001,
    dominusPreset2: 9002,
    dominusPreset3: 9003,
    dominusPreset4: 9004,
};

// ===== WHEELS =====
export const WHEELS = {
    cristiano: 386,
    alpha: 358,
    dieci: 363,
    urus: 10998,
    skyline: 11000,
};

// ===== MAPPING COULEURS HEX -> PAINT ID =====
export const HEX_TO_PAINT = {
    '#171617': PAINT.BLACK,
    '#808080': PAINT.GREY,
    '#ffffff': PAINT.TITANIUMWHITE,
    '#13aae6': PAINT.SKYBLUE,
    '#b7ff00': PAINT.LIME,
    '#ffd034': PAINT.SAFFRON,
    '#ff8c00': PAINT.ORANGE,
    '#ff49b3': PAINT.PINK,
    '#8a2be2': PAINT.PURPLE,
};


export const PAINT_COLORS = {
    [PAINT.NONE]: { hex: '#000000', r: 0, g: 0, b: 0 },
    [PAINT.CRIMSON]: { hex: '#ff0000', r: 255, g: 0, b: 0 },
    [PAINT.LIME]: { hex: '#00ff00', r: 0, g: 255, b: 0 },
    [PAINT.BLACK]: { hex: '#171617', r: 23, g: 22, b: 23 },
    [PAINT.SKYBLUE]: { hex: '#13aae6', r: 19, g: 170, b: 230 },
    [PAINT.COBALT]: { hex: '#0000ff', r: 0, g: 0, b: 255 },
    [PAINT.BURNTSIENNA]: { hex: '#8b4513', r: 139, g: 69, b: 19 },
    [PAINT.FORESTGREEN]: { hex: '#228b22', r: 34, g: 139, b: 34 },
    [PAINT.PURPLE]: { hex: '#8a2be2', r: 138, g: 43, b: 226 },
    [PAINT.PINK]: { hex: '#ff49b3', r: 255, g: 73, b: 179 },
    [PAINT.ORANGE]: { hex: '#ff8c00', r: 255, g: 140, b: 0 },
    [PAINT.GREY]: { hex: '#808080', r: 128, g: 128, b: 128 },
    [PAINT.TITANIUMWHITE]: { hex: '#ffffff', r: 255, g: 255, b: 255 },
    [PAINT.SAFFRON]: { hex: '#ffd034', r: 255, g: 208, b: 52 },
    [PAINT.GOLD]: { hex: '#ffd700', r: 255, g: 215, b: 0 },
    [PAINT.ROSEGOLD]: { hex: '#b76e79', r: 183, g: 110, b: 121 },
    [PAINT.WHITEGOLD]: { hex: '#ffe5b4', r: 255, g: 229, b: 180 },
    [PAINT.ONYX]: { hex: '#353839', r: 53, g: 56, b: 57 },
    [PAINT.PLATINUM]: { hex: '#e5e4e2', r: 229, g: 228, b: 226 },
};

/**
 * Convertit une couleur hex en RGB
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

/**
 * Calcule la distance entre deux couleurs (formule euclidienne)
 */
function colorDistance(color1, color2) {
    const dr = color1.r - color2.r;
    const dg = color1.g - color2.g;
    const db = color1.b - color2.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Trouve le paint ID le plus proche d'une couleur hex
 */
export function findClosestPaint(hexColor) {
    if (!hexColor) return PAINT.NONE;
    
    const targetColor = hexToRgb(hexColor);
    
    let closestPaint = PAINT.NONE;
    let smallestDistance = Infinity;
    
    // Parcourt toutes les couleurs BakkesMod
    for (const [paintId, paintColor] of Object.entries(PAINT_COLORS)) {
        const distance = colorDistance(targetColor, paintColor);
        
        if (distance < smallestDistance) {
            smallestDistance = distance;
            closestPaint = parseInt(paintId);
        }
    }
    
    console.log(`🎨 Color match: ${hexColor} → Paint ID ${closestPaint} (distance: ${smallestDistance.toFixed(2)})`);
    
    return closestPaint;
}
/**
 * Génère un code BakkesMod
 */
export function generateBakkesModCode(bodyId, bodyPaint, textureId, wheelsId, wheelsPaint) {
    const buffer = new Uint8Array(15);
    let bitPos = 0;
    
    function writeBits(value, count) {
        for (let i = 0; i < count; i++) {
            const bit = (value >> i) & 1;
            const byteIndex = Math.floor(bitPos / 8);
            const bitIndex = bitPos % 8;
            if (bit) {
                buffer[byteIndex] |= (1 << bitIndex);
            }
            bitPos++;
        }
    }
    
    // Header
    writeBits(4, 6);
    writeBits(15, 10);
    writeBits(0, 8);
    
    // Body
    writeBits(1, 1);
    writeBits(3, 4);
    
    // Item 1: Body
    writeBits(0, 5);
    writeBits(bodyId, 16);
    if (bodyPaint > 0) {
        writeBits(1, 1);
        writeBits(bodyPaint, 6);
    } else {
        writeBits(0, 1);
    }
    
    // Item 2: Texture
    writeBits(1, 5);
    writeBits(textureId, 16);
    writeBits(0, 1);
    
    // Item 3: Wheels
    writeBits(2, 5);
    writeBits(wheelsId, 16);
    if (wheelsPaint > 0) {
        writeBits(1, 1);
        writeBits(wheelsPaint, 6);
    } else {
        writeBits(0, 1);
    }
    
    writeBits(0, 1);
    writeBits(0, 6);
    
    // CRC
    let crc = 0xFF;
    for (let i = 3; i < 15; i++) {
        crc ^= buffer[i];
    }
    buffer[2] = crc;
    
    let binary = '';
    for (let i = 0; i < buffer.length; i++) {
        binary += String.fromCharCode(buffer[i]);
    }
    
    return btoa(binary);
}

/**
 * Génère le code à partir de l'état UI
 */
export function generateCodeFromState(carState, carType) {
    const bodyId = BODY[carType] || BODY.octane;
    
    // ✅ Récupère la paint de la voiture depuis l'état
    const bodyPaint = findClosestPaint(carState.paintColor);
    
    let textureId = DECAL.NONE;
    if (carState.selectedPresetTexture && DECAL[carState.selectedPresetTexture]) {
        textureId = DECAL[carState.selectedPresetTexture];
    }
    
    const wheelsId = WHEELS[carState.wheelType] || WHEELS.dieci;
    const wheelsPaint = findClosestPaint(carState.wheelColor);
    
    console.log('🎨 BakkesMod Generation:', {
        body: carType, bodyId,
        bodyPaint: bodyPaint, paintColor: carState.paintColor,
        texture: carState.selectedPresetTexture, textureId,
        wheels: carState.wheelType, wheelsId,
        wheelsPaint: wheelsPaint, wheelColor: carState.wheelColor
    });
    
    return generateBakkesModCode(bodyId, bodyPaint, textureId, wheelsId, wheelsPaint);
}

// export default {
//     PAINT, BODY, DECAL, WHEELS, HEX_TO_PAINT,
//     findClosestPaint, generateBakkesModCode, generateCodeFromState
// };