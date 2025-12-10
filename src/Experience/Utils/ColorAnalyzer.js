// src/Experience/Utils/ColorAnalyzer.js
import * as THREE from 'three'

export default class ColorAnalyzer {
    /**
     * Extrait les N couleurs dominantes d'une texture
     * @param {THREE.Texture} texture 
     * @param {Number} colorCount - Nombre de couleurs à extraire (2-3 recommandé)
     * @returns {Array<String>} - Array de couleurs hex
     */
    static getDominantColors(texture, colorCount = 2) {
        if (!texture || !texture.image) {
            console.error('❌ Invalid texture for color analysis')
            return ['#171617', '#f1f1f1'] // Fallback
        }

        console.log('🔍 Analyzing texture:', {
            image: texture.image,
            width: texture.image.width,
            height: texture.image.height,
            complete: texture.image.complete,
            src: texture.image.src?.substring(0, 50) + '...'
        })

        // ✅ Vérifie que l'image est vraiment chargée
        if (!texture.image.complete || texture.image.width === 0) {
            console.error('❌ Texture image not ready!')
            return ['#171617', '#f1f1f1']
        }

        try {
            // Crée un canvas temporaire pour lire les pixels
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            
            // Redimensionne pour optimiser (pas besoin d'analyser chaque pixel)
            const sampleSize = 100
            canvas.width = sampleSize
            canvas.height = sampleSize
            
            // Dessine la texture sur le canvas
            ctx.drawImage(texture.image, 0, 0, sampleSize, sampleSize)
            
            // Récupère les données de pixels
            const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize)
            const pixels = imageData.data
            
            console.log('📊 Total pixels to analyze:', pixels.length / 4)
            
            // Collecte les couleurs (en ignorant les pixels trop sombres/transparents)
            const colorMap = new Map()
            let skippedDark = 0
            let skippedTransparent = 0
            let validPixels = 0
            
            for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i]
                const g = pixels[i + 1]
                const b = pixels[i + 2]
                const a = pixels[i + 3]
                
                // Ignore les pixels transparents
                if (a < 50) {
                    skippedTransparent++
                    continue
                }
                
                // ✅ Filtre modifié : plus permissif pour les pixels sombres
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
                skippedDark,
                skippedTransparent,
                uniqueColors: colorMap.size
            })
            
            // ✅ Si pas assez de couleurs valides, fallback
            if (colorMap.size < 2) {
                console.warn('⚠️ Not enough color variety, using fallback')
                return ['#e3b405', '#f1f1f1']
            }
            
            // Trie par fréquence
            const sortedColors = Array.from(colorMap.entries())
                .sort((a, b) => b[1] - a[1])
            
            console.log('🎨 Top 5 colors:', sortedColors.slice(0, 5).map(([rgb, count]) => {
                const [r, g, b] = rgb.split(',').map(Number)
                return {
                    rgb: `rgb(${r},${g},${b})`,
                    hex: this.rgbToHex(r, g, b),
                    count,
                    percentage: ((count / validPixels) * 100).toFixed(1) + '%'
                }
            }))
            
            // ✅ Prend les couleurs mais évite celles trop similaires
            const selectedColors = []
            for (const [rgb] of sortedColors) {
                const [r, g, b] = rgb.split(',').map(Number)
                const hex = this.rgbToHex(r, g, b)
                
                // Vérifie que cette couleur n'est pas trop proche des déjà sélectionnées
                const isTooSimilar = selectedColors.some(existing => {
                    return this.colorDistance(hex, existing) < 50 // seuil de similarité
                })
                
                if (!isTooSimilar) {
                    selectedColors.push(hex)
                }
                
                if (selectedColors.length >= colorCount) break
            }
            
            // Si pas assez de couleurs différentes, complète avec du blanc
            while (selectedColors.length < colorCount) {
                selectedColors.push('#f1f1f1')
            }
            
            console.log('✅ Final selected colors:', selectedColors)
            
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
        // ✅ Clamp les valeurs au cas où
        r = Math.max(0, Math.min(255, Math.round(r)))
        g = Math.max(0, Math.min(255, Math.round(g)))
        b = Math.max(0, Math.min(255, Math.round(b)))
        
        return '#' + [r, g, b]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('')
    }
}