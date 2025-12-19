// src/Experience/Utils/ColorAnalyzer.js
import * as THREE from 'three'

export default class ColorAnalyzer {
    
    // Cache pour stocker les masques chargés
    static maskCache = new Map()
    
    /**
     * Charge un masque pour un type de voiture
     * @param {String} carType - 'fennec', 'octane', 'dominus'
     * @returns {Promise<ImageData|null>}
     */
    static async loadMask(carType) {
        // Vérifie le cache
        if (this.maskCache.has(carType)) {
            return this.maskCache.get(carType)
        }
        
        return new Promise((resolve) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            
            img.onload = () => {
                // Crée un canvas pour extraire les données du masque
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d', { willReadFrequently: true })
                
                // Utilise la même taille que l'analyse (100x100)
                const sampleSize = 100
                canvas.width = sampleSize
                canvas.height = sampleSize
                
                ctx.drawImage(img, 0, 0, sampleSize, sampleSize)
                const maskData = ctx.getImageData(0, 0, sampleSize, sampleSize)
                
                // Cache le masque
                this.maskCache.set(carType, maskData)
                
                console.log(`✅ Mask loaded for ${carType}`)
                resolve(maskData)
            }
            
            img.onerror = () => {
                console.warn(`⚠️ No mask found for ${carType}, using full texture`)
                this.maskCache.set(carType, null)
                resolve(null)
            }
            
            // Chemin vers le masque
            img.src = `textures/cars/${carType}/ColorMask.png`
        })
    }
    
    /**
     * Vérifie si un pixel du masque est "actif" (blanc/clair)
     * @param {ImageData} maskData 
     * @param {Number} index - Index du pixel (i dans la boucle pixels)
     * @param {Number} threshold - Seuil de luminosité (0-255), défaut 128
     * @returns {Boolean}
     */
    static isMaskPixelActive(maskData, index, threshold = 128) {
        if (!maskData) return true // Pas de masque = tous les pixels sont actifs
        
        const r = maskData.data[index]
        const g = maskData.data[index + 1]
        const b = maskData.data[index + 2]
        
        // Calcule la luminosité moyenne
        const brightness = (r + g + b) / 3
        
        return brightness >= threshold
    }
    
    /**
     * Extrait les N couleurs dominantes d'une texture avec masque optionnel
     * @param {THREE.Texture} texture 
     * @param {Number} colorCount - Nombre de couleurs à extraire (2-3 recommandé)
     * @param {String} carType - Type de voiture pour charger le masque correspondant
     * @returns {Promise<Array<String>>} - Array de couleurs hex
     */
    static async getDominantColorsWithMask(texture, colorCount = 2, carType = null) {
        if (!texture || !texture.image) {
            console.error('❌ Invalid texture for color analysis')
            return ['#171617', '#f1f1f1']
        }

        // Vérifie que l'image est vraiment chargée
        if (!texture.image.complete || texture.image.width === 0) {
            console.error('❌ Texture image not ready!')
            return ['#171617', '#f1f1f1']
        }

        // Charge le masque si un carType est fourni
        let maskData = null
        if (carType) {
            maskData = await this.loadMask(carType)
        }

        try {
            // Crée un canvas temporaire pour lire les pixels
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            
            const sampleSize = 100
            canvas.width = sampleSize
            canvas.height = sampleSize
            
            // Dessine la texture sur le canvas
            ctx.drawImage(texture.image, 0, 0, sampleSize, sampleSize)
            
            // Récupère les données de pixels
            const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize)
            const pixels = imageData.data
            
            console.log('📊 Analyzing texture with mask:', {
                carType,
                hasMask: !!maskData,
                totalPixels: pixels.length / 4
            })
            
            // Collecte les couleurs
            const colorMap = new Map()
            let skippedByMask = 0
            let skippedDark = 0
            let skippedTransparent = 0
            let validPixels = 0
            
            for (let i = 0; i < pixels.length; i += 4) {
                // 🆕 Vérifie d'abord si le pixel est dans la zone du masque
                if (maskData && !this.isMaskPixelActive(maskData, i)) {
                    skippedByMask++
                    continue
                }
                
                const r = pixels[i]
                const g = pixels[i + 1]
                const b = pixels[i + 2]
                const a = pixels[i + 3]
                
                // Ignore les pixels transparents
                if (a < 50) {
                    skippedTransparent++
                    continue
                }
                
                // Ignore les pixels trop sombres
                if (r < 20 && g < 20 && b < 20) {
                    skippedDark++
                    continue
                }
                
                validPixels++
                
                // Quantize les couleurs pour regrouper les similaires
                const qr = Math.round(r / 20) * 20
                const qg = Math.round(g / 20) * 20
                const qb = Math.round(b / 20) * 20
                
                const key = `${qr},${qg},${qb}`
                colorMap.set(key, (colorMap.get(key) || 0) + 1)
            }
            
            console.log('📈 Analysis stats:', {
                validPixels,
                skippedByMask,
                skippedDark,
                skippedTransparent,
                uniqueColors: colorMap.size
            })
            
            // Si pas assez de couleurs valides, fallback
            if (colorMap.size < 2) {
                console.warn('⚠️ Not enough color variety, using fallback')
                return ['#e3b405', '#f1f1f1']
            }
            
            // Trie par fréquence
            const sortedColors = Array.from(colorMap.entries())
                .sort((a, b) => b[1] - a[1])
            
            console.log('🎨 Top 5 colors (with mask):', sortedColors.slice(0, 5).map(([rgb, count]) => {
                const [r, g, b] = rgb.split(',').map(Number)
                return {
                    rgb: `rgb(${r},${g},${b})`,
                    hex: this.rgbToHex(r, g, b),
                    count,
                    percentage: ((count / validPixels) * 100).toFixed(1) + '%'
                }
            }))
            
            // Sélectionne les couleurs en évitant celles trop similaires
            const selectedColors = []
            for (const [rgb] of sortedColors) {
                const [r, g, b] = rgb.split(',').map(Number)
                const hex = this.rgbToHex(r, g, b)
                
                // Vérifie que cette couleur n'est pas trop proche des déjà sélectionnées
                const isTooSimilar = selectedColors.some(existing => {
                    return this.colorDistance(hex, existing) < 50
                })
                
                if (!isTooSimilar) {
                    selectedColors.push(hex)
                }
                
                if (selectedColors.length >= colorCount) break
            }
            
            // Complète avec du blanc si nécessaire
            while (selectedColors.length < colorCount) {
                selectedColors.push('#f1f1f1')
            }
            
            console.log('✅ Final selected colors (with mask):', selectedColors)
            
            return selectedColors
            
        } catch (error) {
            console.error('❌ Error in getDominantColorsWithMask:', error)
            return ['#171617', '#f1f1f1']
        }
    }
    
    /**
     * Version synchrone originale (sans masque) - gardée pour compatibilité
     */
    static getDominantColors(texture, colorCount = 2) {
        if (!texture || !texture.image) {
            console.error('❌ Invalid texture for color analysis')
            return ['#171617', '#f1f1f1']
        }

        if (!texture.image.complete || texture.image.width === 0) {
            console.error('❌ Texture image not ready!')
            return ['#171617', '#f1f1f1']
        }

        try {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            
            const sampleSize = 100
            canvas.width = sampleSize
            canvas.height = sampleSize
            
            ctx.drawImage(texture.image, 0, 0, sampleSize, sampleSize)
            
            const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize)
            const pixels = imageData.data
            
            const colorMap = new Map()
            let skippedDark = 0
            let skippedTransparent = 0
            let validPixels = 0
            
            for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i]
                const g = pixels[i + 1]
                const b = pixels[i + 2]
                const a = pixels[i + 3]
                
                if (a < 50) {
                    skippedTransparent++
                    continue
                }
                
                if (r < 20 && g < 20 && b < 20) {
                    skippedDark++
                    continue
                }
                
                validPixels++
                
                const qr = Math.round(r / 20) * 20
                const qg = Math.round(g / 20) * 20
                const qb = Math.round(b / 20) * 20
                
                const key = `${qr},${qg},${qb}`
                colorMap.set(key, (colorMap.get(key) || 0) + 1)
            }
            
            if (colorMap.size < 2) {
                return ['#e3b405', '#f1f1f1']
            }
            
            const sortedColors = Array.from(colorMap.entries())
                .sort((a, b) => b[1] - a[1])
            
            const selectedColors = []
            for (const [rgb] of sortedColors) {
                const [r, g, b] = rgb.split(',').map(Number)
                const hex = this.rgbToHex(r, g, b)
                
                const isTooSimilar = selectedColors.some(existing => {
                    return this.colorDistance(hex, existing) < 50
                })
                
                if (!isTooSimilar) {
                    selectedColors.push(hex)
                }
                
                if (selectedColors.length >= colorCount) break
            }
            
            while (selectedColors.length < colorCount) {
                selectedColors.push('#f1f1f1')
            }
            
            return selectedColors
            
        } catch (error) {
            console.error('❌ Error in getDominantColors:', error)
            return ['#171617', '#f1f1f1']
        }
    }
    
    /**
     * Calcule la distance entre deux couleurs (0-255 scale)
     */
    static colorDistance(hex1, hex2) {
        const c1 = new THREE.Color(hex1)
        const c2 = new THREE.Color(hex2)
        
        const dr = (c1.r - c2.r) * 255
        const dg = (c1.g - c2.g) * 255
        const db = (c1.b - c2.b) * 255
        
        return Math.sqrt(dr * dr + dg * dg + db * db)
    }
    
    /**
     * Convertit RGB en hex
     */
    static rgbToHex(r, g, b) {
        r = Math.max(0, Math.min(255, Math.round(r)))
        g = Math.max(0, Math.min(255, Math.round(g)))
        b = Math.max(0, Math.min(255, Math.round(b)))
        
        return '#' + [r, g, b]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('')
    }
    
    /**
     * Précharge tous les masques au démarrage
     */
    static async preloadAllMasks() {
        const carTypes = ['fennec', 'octane', 'dominus']
        
        console.log('🎭 Preloading color masks...')
        
        await Promise.all(carTypes.map(carType => this.loadMask(carType)))
        
        console.log('✅ All masks preloaded')
    }
}