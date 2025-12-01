import * as THREE from 'three'
import Experience from '../Experience.js'
import { paintFinishes } from '../configs/paintFinishes.js'
import { carMaterialConfig } from '../configs/carMaterialConfig.js'

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
        this.currentFinish = 'glossy'
        this.currentAccentColor = '#FF0000'
        this.currentExtraColor = '#0000FF'
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
                child.castShadow = true
                child.receiveShadow = true
            }
        })
        
        console.log(`Found ${meshList.length} meshes in ${this.carType}`)
        
        // ✅ Assigne selon l'ordre : 0=body, 1=chassis, 2=paint, 3=windows
        if(meshList.length == 4) {
            this.meshes.body = meshList[0]      // Body_Grain_SKmd001
            this.meshes.chassis = meshList[1]   // Body_Grain_SKmd001_1
            this.meshes.paint = meshList[2]     // Body_Grain_SKmd001_2
            this.meshes.windows = meshList[3]   // Body_Grain_SKmd001_3
            
            console.log('✅ Mesh assignment:')
            console.log(`  [0] Body → ${this.meshes.body.name}`)
            console.log(`  [1] Chassis → ${this.meshes.chassis.name}`)
            console.log(`  [2] Paint (Accents) → ${this.meshes.paint.name}`)
            console.log(`  [3] Windows → ${this.meshes.windows.name}`)
        } else {
            console.error(`⚠️ Expected 4 meshes but found ${meshList.length}`)
        }
        
        // ✅ Pour Dominus avec 5 mesh
        if(meshList.length == 5 && this.carType === 'dominus') {
            this.meshes.extraColor = meshList[4]
            console.log(`  [4] Extra Color → ${this.meshes.extraColor.name}`)
        }

        
    }
    
    // ✅ Applique les matériaux sur chaque mesh
    applyMaterials() {
        // 1. BODY MATERIAL (avec texture user sur UV1)
        if(this.meshes.body) {
            const defaultTexture = this.resources.items[`${this.carType}DefaultBody`]
            
            if(defaultTexture) {
                defaultTexture.flipY = false
                defaultTexture.colorSpace = THREE.SRGBColorSpace
            }
            
            this.meshes.body.material = new THREE.MeshStandardMaterial({
                map: defaultTexture,
                ...paintFinishes[this.currentFinish]
            })
            
            // ✅ Force l'utilisation de UV1 pour le Body
            this.setMaterialUVMap(this.meshes.body.material, 1)
            
            console.log('✅ Body material applied with UV1')
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
            
            console.log('✅ Chassis material applied with textures (UV0)')
        }
        
        // 3. PAINT MATERIAL (couleur unie = Accents)
        if(this.meshes.paint) {
            this.meshes.paint.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(this.currentAccentColor),
                roughness: 0.318,
                metalness: 0.316
            })
            console.log('✅ Paint/Accents material applied (solid color)')
        }
        
        // // 4. WINDOWS MATERIAL
        if(this.meshes.windows) {
            this.meshes.windows.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x000000), // couleur de la teinte
                roughness: 0.1,                   // plus petit = plus de reflets
                metalness: 0.0,        
            })
            console.log('✅ Windows material applied')
        }
        
        // 5. EXTRA COLOR (Dominus seulement)
        if(this.meshes.extraColor && this.carType === 'dominus') {
            this.meshes.extraColor.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(this.currentExtraColor),
                roughness: 0.5,
                metalness: 0.6
            })
            console.log('✅ Extra color material applied (Dominus)')
        }
    }
    
    // ✅ Force un matériau à utiliser un UV channel spécifique
    setMaterialUVMap(material, uvIndex) {
        // 0 = uv, 1 = uv1, 2 = uv2, 3 = uv3
        if(material.map) material.map.channel = uvIndex
        if(material.normalMap) material.normalMap.channel = uvIndex
        if(material.roughnessMap) material.roughnessMap.channel = uvIndex
        if(material.metalnessMap) material.metalnessMap.channel = uvIndex
        if(material.emissiveMap) material.emissiveMap.channel = uvIndex
        if(material.aoMap) material.aoMap.channel = uvIndex
        if(material.bumpMap) material.bumpMap.channel = uvIndex
        if(material.displacementMap) material.displacementMap.channel = uvIndex
        if(material.alphaMap) material.alphaMap.channel = uvIndex
        if(material.lightMap) material.lightMap.channel = uvIndex
        
        material.needsUpdate = true
        
        console.log(`✅ Material textures set to UV channel ${uvIndex}`)
    }
    
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
            mat.clearcoat = finish.clearcoat
            mat.clearcoatRoughness = finish.clearcoatRoughness
            mat.envMapIntensity = finish.envMapIntensity
            mat.needsUpdate = true
        }
        
        console.log(`✅ Applied finish: ${finish.name}`)
    }
    
    // ✅ Changer la couleur Paint/Accents
    setAccentColor(color) {
        this.currentAccentColor = color
        
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
            console.log(`✅ Extra color changed to ${color} (Dominus only)`)
        }
    }
    
    // ✅ Charger une texture utilisateur (sur Body avec UV1)
    loadUserTexture(file) {
        const reader = new FileReader()
        
        reader.onload = (e) => {
            const textureLoader = new THREE.TextureLoader()
            
            textureLoader.load(e.target.result, (texture) => {
                texture.flipY = false
                texture.colorSpace = THREE.SRGBColorSpace
                
                if(this.currentBodyTexture) {
                    this.currentBodyTexture.dispose()
                }
                
                if(this.meshes.body && this.meshes.body.material) {
                    this.meshes.body.material.map = texture
                    this.meshes.body.material.needsUpdate = true
                }
                
                this.currentBodyTexture = texture
                
                console.log('✅ User texture loaded on Body (UV1)!')
            })
        }
        
        reader.readAsDataURL(file)
    }
    
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
            accentColor: this.currentAccentColor,
            extraColor: this.currentExtraColor
        }
        
        this.debugFolder
            .addColor(colorParams, 'accentColor')
            .name('Accent Color (Paint)')
            .onChange(value => this.setAccentColor(value))
        
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