import * as THREE from 'three'
import Experience from '../Experience.js'
import { paintFinishes } from '../configs/paintFinishes.js'
import { carMaterialConfig } from '../configs/carMaterialConfig.js'
import ColorAnalyzer from '../Utils/ColorAnalyzer.js'

export default class CarCustomizer {
    constructor(carType, carModel) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        
        this.carType = carType
        this.carModel = carModel
        this.config = carMaterialConfig[carType]
        
        if(!this.config) {
            console.error(`No material config found for car type: ${carType}`)
            return
        }
        
        
        // État actuel
        this.currentFinish = 'anodized'
        this.currentPaintColor = '#171617'
        this.currentExtraColor = '#171617'
        this.currentBodyTexture = null
        
        // Stockage des mesh
        this.meshes = {
            body: null,      // Index 0 → Body_Grain_SKmd001
            chassis: null,   // Index 1 → Body_Grain_SKmd001_1
            paint: null,     // Index 2 → Body_Grain_SKmd001_2
            windows: null    // Index 3 → Body_Grain_SKmd001_3
        }
        
        this.findMeshesByIndex()
        this.applyMaterials()
        
        if(this.debug.active) {
            this.setupDebug()
        }
    }
    
    // ✅ Trouve les mesh par leur INDEX d'apparition
    findMeshesByIndex() {
        const meshList = []
        
        // Collecte tous les mesh
        this.carModel.traverse(child => {
            if(child instanceof THREE.Mesh) {
                meshList.push(child)
                // child.castShadow = true
                // child.receiveShadow = true
            }
        })
        
        // console.log(`Found ${meshList.length} meshes in ${this.carType}`)
        
        // ✅ Assigne selon l'ordre : 0=body, 1=chassis, 2=paint, 3=windows
        if(meshList.length == 4) {
            this.meshes.body = meshList[0]      // Body_Grain_SKmd001
            this.meshes.chassis = meshList[1]   // Body_Grain_SKmd001_1
            this.meshes.paint = meshList[2]     // Body_Grain_SKmd001_2
            this.meshes.windows = meshList[3]   // Body_Grain_SKmd001_3
            
            // console.log('✅ Mesh assignment:')
            // console.log(`  [0] Body → ${this.meshes.body.name}`)
            // console.log(`  [1] Chassis → ${this.meshes.chassis.name}`)
            // console.log(`  [2] Paint → ${this.meshes.paint.name}`)
            // console.log(`  [3] Windows → ${this.meshes.windows.name}`)
        } else {
            console.error(`⚠️ Expected 4 meshes but found ${meshList.length}`)
        }
        
        // ✅ Pour Dominus avec 5 mesh
        if(meshList.length == 5 && this.carType === 'dominus') {
            this.meshes.body = meshList[0]      // Body_Grain_SKmd001
            this.meshes.chassis = meshList[1]   // Body_Grain_SKmd001_1
            this.meshes.paint = meshList[2]     // Body_Grain_SKmd001_2
            this.meshes.windows = meshList[3]   // Body_Grain_SKmd001_3
            this.meshes.extraColor = meshList[4]
            
            // console.log('✅ Mesh assignment:')
            // console.log(`  [0] Body → ${this.meshes.body.name}`)
            // console.log(`  [1] Chassis → ${this.meshes.chassis.name}`)
            // console.log(`  [2] Paint → ${this.meshes.paint.name}`)
            // console.log(`  [3] Windows → ${this.meshes.windows.name}`)
            // console.log(`  [4] Extra Color → ${this.meshes.extraColor.name}`)
        }

        
    }
    
    // ✅ Applique les matériaux sur chaque mesh
    applyMaterials() {
        // 1. BODY MATERIAL (avec texture user sur UV1)
        if(this.meshes.body) {
            // 🔍 Cherche d'abord une texture custom dans resources
            const customKey = `customBody_${this.carType}`
            let bodyTexture = this.resources.items[customKey]
            
            // Si pas de texture custom, utilise preset1 par défaut
            if(!bodyTexture) {
                bodyTexture = this.resources.items[`${this.carType}Preset1`] // 🆕 Remplace DefaultBody par Preset1
                
                if(bodyTexture) {
                    bodyTexture.flipY = false
                    bodyTexture.colorSpace = THREE.SRGBColorSpace
                }
            } else {
                console.log(`✅ Using custom texture for ${this.carType}`)
            }
            
            this.meshes.body.material = new THREE.MeshStandardMaterial({
                map: bodyTexture,
                ...paintFinishes[this.currentFinish]
            })
            
            this.currentBodyTexture = bodyTexture

            if(bodyTexture && bodyTexture.image) {
                if(bodyTexture.image.complete) {
                    this.updateBackground()
                } else {
                    bodyTexture.image.onload = () => {
                        console.log('🎨 Texture image loaded, updating background...')
                        this.updateBackground()
                    }
                }
            }
        }
        
        // 2. CHASSIS MATERIAL (avec textures baked sur UV0)
        if(this.meshes.chassis) {
            const chassisColor = this.resources.items[`${this.carType}ChassisColor`]
            const chassisNormal = this.resources.items[`${this.carType}ChassisNormal`]
            const chassisEmissive = this.resources.items[`${this.carType}ChassisEmissive`]
            
            if(chassisColor) {
                chassisColor.flipY = false
                chassisColor.colorSpace = THREE.SRGBColorSpace
            }
            if(chassisNormal) {
                chassisNormal.flipY = false
                chassisNormal.colorSpace = THREE.LinearSRGBColorSpace
            }
            if(chassisEmissive) {
                chassisEmissive.flipY = false
                chassisEmissive.colorSpace = THREE.SRGBColorSpace
            }
            
            this.meshes.chassis.material = new THREE.MeshStandardMaterial({
                map: chassisColor,
                metalness: 0.636,
                roughness: 0.459,
                normalMap: chassisNormal,
                emissiveMap: chassisEmissive,
                emissive: new THREE.Color(0xffffff),
                emissiveIntensity: 2
            })
            
            // console.log('✅ Chassis material applied with textures (UV0)')
        }
        
        // 3. PAINT MATERIAL
        if(this.meshes.paint) {
            this.meshes.paint.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(this.currentPaintColor),
                roughness: 0.318,
                metalness: 0.316
            })
            // console.log('✅ Paint material applied (solid color)')
        }
        
        // // 4. WINDOWS MATERIAL
        if(this.meshes.windows) {
            this.meshes.windows.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x000000), // couleur de la teinte
                roughness: 0.1,                   // plus petit = plus de reflets
                metalness: 0.0,        
            })
            // console.log('✅ Windows material applied')
        }
        
        // 5. EXTRA COLOR (Dominus seulement)
        if(this.meshes.extraColor && this.carType === 'dominus') {
            this.meshes.extraColor.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(this.currentExtraColor),
                roughness: 0.5,
                metalness: 0.6
            })
            // console.log('✅ Extra color material applied (Dominus)')
        }
    }

    // Mettre à jour le fond
    updateBackground() {
        if (!this.currentBodyTexture) return
        
        // Extrait 2 couleurs dominantes
        const [color1, color2] = ColorAnalyzer.getDominantColors(
            this.currentBodyTexture, 
            2
        )
        // const color1 = ColorAnalyzer.getDominantColors(this.currentBodyTexture, 1)
        
        console.log('🎨 Dominant colors:', color1, color2)
        
        // Applique au CSS
        if(this.carType == 'dominus' && color1 == "#282828"){
            this.applyGradientBackground(color2)
        }
        else{
            this.applyGradientBackground(color1)
        }
    }

    hexToRgba(hex, alpha = 0.2) {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    // Fonction pour convertir hex -> RGB (utile pour interpolation)
    hexToRgb(hex) {
        return {
            r: parseInt(hex.slice(1, 3), 16),
            g: parseInt(hex.slice(3, 5), 16),
            b: parseInt(hex.slice(5, 7), 16),
        }
    }

    // Interpolation linéaire entre 2 couleurs
    interpolateColor(color1, color2, factor) {
        return {
            r: Math.round(color1.r + (color2.r - color1.r) * factor),
            g: Math.round(color1.g + (color2.g - color1.g) * factor),
            b: Math.round(color1.b + (color2.b - color1.b) * factor),
        }
    }

    // RGB -> hex
    rgbToHex({ r, g, b }) {
        return (
            "#" +
            [r, g, b]
                .map(v => v.toString(16).padStart(2, "0"))
                .join("")
        )
    }

    // Génération des 3 couleurs intermédiaires
    generateGradientColors(startHex, endHex) {
        const start = this.hexToRgb(startHex)
        const end = this.hexToRgb(endHex)
        return [
            this.rgbToHex(this.interpolateColor(start, end, 0.25)),
            this.rgbToHex(this.interpolateColor(start, end, 0.5)),
            this.rgbToHex(this.interpolateColor(start, end, 0.75)),
        ]
    }

    // Applique le gradient
    applyGradientBackground(color) {
        const gradient = document.querySelector('.background-gradient')
        if (!gradient) return        

        const endColor = '#171617'
        const [c1, c2, c3] = this.generateGradientColors(color, endColor)

        gradient.style.backgroundColor = endColor; // fond global noir

        gradient.style.backgroundImage = `
            radial-gradient(circle at -30% 130%, 
                ${this.hexToRgba(color, 1)} 0%, 
                ${this.hexToRgba(c1, 0.6)} 20%,
                ${this.hexToRgba(c2, 0.3)} 40%, 
                ${this.hexToRgba(c3, 0.1)} 60%,
                ${this.hexToRgba(endColor, 0)} 100%
            ),
            radial-gradient(circle at 130% -30%, 
                ${this.hexToRgba(color, 1)} 0%, 
                ${this.hexToRgba(c1, 0.6)} 20%,
                ${this.hexToRgba(c2, 0.3)} 40%, 
                ${this.hexToRgba(c3, 0.1)} 60%,
                ${this.hexToRgba(endColor, 0)} 100%
            )
        `

        // Animation de transition
        gradient.style.transition = 'background 0.8s ease-in-out'
    }

    // Ajoute une méthode pour appliquer une texture custom déjà chargée
    applyCustomTexture(texture) {
        if(this.meshes.body && this.meshes.body.material) {
            this.meshes.body.material.map = texture
            this.meshes.body.material.needsUpdate = true
            this.currentBodyTexture = texture
            console.log(`✅ Custom texture applied to ${this.carType}`)
            // 🔧 Attend que la texture soit chargée avant de mettre à jour le background
            if(texture.image) {
                if(texture.image.complete) {
                    this.updateBackground()
                } else {
                    texture.image.onload = () => {
                        console.log('🎨 Custom texture loaded, updating background...')
                        this.updateBackground()
                    }
                }
            }
        }
    }

    resetBodyTexture() {
        const defaultTexture = this.resources.items[`${this.carType}Preset1`] // 🆕 Utilise Preset1
        
        if(defaultTexture && this.meshes.body && this.meshes.body.material) {
            this.meshes.body.material.map = defaultTexture
            this.meshes.body.material.needsUpdate = true
            this.currentBodyTexture = defaultTexture
            
            console.log(`✅ Body texture reset to preset1 for ${this.carType}`)
        }
    }
    
    // ✅ Force un matériau à utiliser un UV channel spécifique
    // setMaterialUVMap(material, uvIndex) {
    //     // 0 = uv, 1 = uv1, 2 = uv2, 3 = uv3
    //     if(material.map) material.map.channel = uvIndex
    //     if(material.normalMap) material.normalMap.channel = uvIndex
    //     if(material.roughnessMap) material.roughnessMap.channel = uvIndex
    //     if(material.metalnessMap) material.metalnessMap.channel = uvIndex
    //     if(material.emissiveMap) material.emissiveMap.channel = uvIndex
    //     if(material.aoMap) material.aoMap.channel = uvIndex
    //     if(material.bumpMap) material.bumpMap.channel = uvIndex
    //     if(material.displacementMap) material.displacementMap.channel = uvIndex
    //     if(material.alphaMap) material.alphaMap.channel = uvIndex
    //     if(material.lightMap) material.lightMap.channel = uvIndex
        
    //     material.needsUpdate = true
        
    //     console.log(`✅ Material textures set to UV channel ${uvIndex}`)
    // }
    
    // ✅ Changer le finish (sur le Body seulement)
    setFinish(finishType) {
        if(!paintFinishes[finishType]) {
            console.error(`Finish type ${finishType} not found!`)
            return
        }
        
        this.currentFinish = finishType
        const finish = paintFinishes[finishType]
        
        if(this.meshes.body && this.meshes.body.material) {
            const mat = this.meshes.body.material
            mat.roughness = finish.roughness
            mat.metalness = finish.metalness
            mat.envMapIntensity = finish.envMapIntensity
            mat.needsUpdate = true
        }
        
        console.log(`✅ Applied finish: ${finish.name}`)
    }
    
    // ✅ Changer la couleur Paint
    setPaintColor(color) {
        this.currentPaintColor = color
        
        if(this.meshes.paint && this.meshes.paint.material) {
            this.meshes.paint.material.color.set(color)
            this.meshes.paint.material.needsUpdate = true
        }
    }
    
    // ✅ Changer la couleur extra (Dominus seulement)
    setExtraColor(color) {
        this.currentExtraColor = color
        
        if(this.meshes.extraColor && this.meshes.extraColor.material) {
            this.meshes.extraColor.material.color.set(color)
            this.meshes.extraColor.material.needsUpdate = true
            // console.log(`✅ Extra color changed to ${color} (Dominus only)`)
        }
    }

    // ✅ Réinitialiser la texture du body à la texture par défaut
    resetBodyTexture() {
        const defaultTexture = this.resources.items[`${this.carType}DefaultBody`]
        
        if(defaultTexture && this.meshes.body && this.meshes.body.material) {
            if(this.currentBodyTexture && this.currentBodyTexture !== defaultTexture) {
                this.currentBodyTexture.dispose()
            }
            
            this.meshes.body.material.map = defaultTexture
            this.meshes.body.material.needsUpdate = true
            this.currentBodyTexture = defaultTexture
            
            console.log(`✅ Body texture reset to default for ${this.carType}`)
        }
    }

    // Remplace la méthode loadUserTexture par cette version avec plus de logs
    // loadUserTexture(fileOrDataURL) {
    //     console.log('🔍 loadUserTexture called with:', typeof fileOrDataURL)
        
    //     // Si c'est une string (dataURL), on charge directement
    //     if(typeof fileOrDataURL === 'string') {
    //         console.log('📦 Loading from dataURL, length:', fileOrDataURL.length)
    //         const textureLoader = new THREE.TextureLoader()
            
    //         textureLoader.load(
    //             fileOrDataURL, 
    //             (texture) => {
    //                 console.log('✅ Texture loaded successfully!')
    //                 console.log('   - Size:', texture.image.width, 'x', texture.image.height)
    //                 console.log('   - Format:', texture.format)
                    
    //                 texture.flipY = false
    //                 texture.colorSpace = THREE.SRGBColorSpace
    //                 texture.needsUpdate = true
                    
    //                 console.log('   - flipY:', texture.flipY)
    //                 console.log('   - colorSpace:', texture.colorSpace)
                    
    //                 if(this.currentBodyTexture) {
    //                     const defaultTexture = this.resources.items[`${this.carType}DefaultBody`]
    //                     if(this.currentBodyTexture !== defaultTexture) {
    //                         console.log('🗑️ Disposing old custom texture')
    //                         this.currentBodyTexture.dispose()
    //                     }
    //                 }
                    
    //                 if(this.meshes.body && this.meshes.body.material) {
    //                     console.log('🎨 Applying texture to body material')
    //                     console.log('   - Material type:', this.meshes.body.material.type)
    //                     console.log('   - Material before:', this.meshes.body.material.map)
                        
    //                     this.meshes.body.material.map = texture
    //                     this.meshes.body.material.needsUpdate = true
                        
    //                     console.log('   - Material after:', this.meshes.body.material.map)
    //                     console.log('   - Material color:', this.meshes.body.material.color)
    //                     console.log('   - Material metalness:', this.meshes.body.material.metalness)
    //                     console.log('   - Material roughness:', this.meshes.body.material.roughness)
    //                 } else {
    //                     console.error('❌ Body mesh or material not found!')
    //                     console.log('   - meshes.body:', this.meshes.body)
    //                     if(this.meshes.body) {
    //                         console.log('   - body.material:', this.meshes.body.material)
    //                     }
    //                 }
                    
    //                 this.currentBodyTexture = texture
                    
    //                 console.log('✅ Texture application complete!')
                    
    //             },
    //             (progress) => {
    //                 console.log('⏳ Loading progress:', progress)
    //             },
    //             (error) => {
    //                 console.error('❌ Error loading texture:', error)
    //             }
    //         )
            
    //         return
    //     }
        
    //     // Si c'est un File, on utilise FileReader
    //     console.log('📁 Loading from File:', fileOrDataURL.name)
    //     console.log('   - Type:', fileOrDataURL.type)
    //     console.log('   - Size:', fileOrDataURL.size, 'bytes')
        
    //     const reader = new FileReader()
        
    //     reader.onload = (e) => {
    //         console.log('📖 FileReader loaded, dataURL length:', e.target.result.length)
    //         const textureLoader = new THREE.TextureLoader()
            
    //         textureLoader.load(
    //             e.target.result, 
    //             (texture) => {
    //                 console.log('✅ Texture loaded from file successfully!')
    //                 console.log('   - Size:', texture.image.width, 'x', texture.image.height)
    //                 console.log('   - Format:', texture.format)
                    
    //                 texture.flipY = false
    //                 texture.colorSpace = THREE.SRGBColorSpace
    //                 texture.needsUpdate = true
                    
    //                 if(this.currentBodyTexture) {
    //                     const defaultTexture = this.resources.items[`${this.carType}DefaultBody`]
    //                     if(this.currentBodyTexture !== defaultTexture) {
    //                         console.log('🗑️ Disposing old custom texture')
    //                         this.currentBodyTexture.dispose()
    //                     }
    //                 }
                    
    //                 if(this.meshes.body && this.meshes.body.material) {
    //                     console.log('🎨 Applying texture to body material')
    //                     this.meshes.body.material.map = texture
    //                     this.meshes.body.material.needsUpdate = true
                        
    //                     console.log('   - Material updated successfully')
    //                 } else {
    //                     console.error('❌ Body mesh or material not found!')
    //                 }
                    
    //                 this.currentBodyTexture = texture
                    
    //                 console.log('✅ User texture loaded from file!')
    //             },
    //             undefined,
    //             (error) => {
    //                 console.error('❌ Error loading texture from file:', error)
    //             }
    //         )
    //     }
        
    //     reader.onerror = (error) => {
    //         console.error('❌ FileReader error:', error)
    //     }
        
    //     reader.readAsDataURL(fileOrDataURL)

    //     console.log(this.currentBodyTexture);
        
    //     setTimeout(() => this.updateBackground(), 100)
    // }
        
    setupDebug() {
        if(!this.debug.active) return
        
        this.debugFolder = this.debug.ui.addFolder(`Car Customizer - ${this.carType}`)
        
        // Debug info
        const debugInfo = {
            showInfo: () => {
                console.log(`=== ${this.carType.toUpperCase()} DEBUG ===`)
                
                Object.entries(this.meshes).forEach(([name, mesh]) => {
                    if(mesh) {
                        console.log(`\n${name.toUpperCase()}:`)
                        console.log('  Mesh name:', mesh.name)
                        console.log('  Material:', mesh.material.type)
                        
                        const geom = mesh.geometry
                        console.log('  UVs available:')
                        if(geom.attributes.uv) console.log('    ✅ UV0')
                        if(geom.attributes.uv1) console.log('    ✅ UV1')
                    }
                })
            }
        }
        
        this.debugFolder
            .add(debugInfo, 'showInfo')
            .name('🔍 Debug Info')
        
        // Finish selector
        const finishParams = { finish: this.currentFinish }
        
        this.debugFolder
            .add(finishParams, 'finish', ['matte', 'glossy', 'metallic', 'anodized'])
            .name('Paint Finish')
            .onChange(value => this.setFinish(value))
        
        // Colors
        const colorParams = { 
            paintColor: this.currentPaintColor,
            extraColor: this.currentExtraColor
        }
        
        this.debugFolder
            .addColor(colorParams, 'paintColor')
            .name('Paint Color')
            .onChange(value => this.setPaintColor(value))
        
        if(this.carType === 'dominus') {
            this.debugFolder
                .addColor(colorParams, 'extraColor')
                .name('Extra Color (Dominus)')
                .onChange(value => this.setExtraColor(value))
        }
        
        // Material properties (Body)
        if(this.meshes.body && this.meshes.body.material) {
            const bodyFolder = this.debugFolder.addFolder('Body Material')
            
            bodyFolder
                .add(this.meshes.body.material, 'roughness', 0, 1, 0.01)
                .name('Roughness')
            
            bodyFolder
                .add(this.meshes.body.material, 'metalness', 0, 1, 0.01)
                .name('Metalness')

        }
    }
    
    destroy() {
        // Dispose tous les matériaux
        Object.values(this.meshes).forEach(mesh => {
            if(mesh && mesh.material) {
                if(Array.isArray(mesh.material)) {
                    mesh.material.forEach(mat => mat.dispose())
                } else {
                    mesh.material.dispose()
                }
            }
        })
        
        if(this.currentBodyTexture) {
            this.currentBodyTexture.dispose()
        }
        
        if(this.debug.active && this.debugFolder) {
            this.debugFolder.destroy()
        }
    }
}