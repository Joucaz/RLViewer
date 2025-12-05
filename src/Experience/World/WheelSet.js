import * as THREE from 'three'
import Experience from '../Experience.js'
import { wheelTypeConfigs } from '../configs/wheelPositions.js'

export default class WheelSet {
    constructor(wheelType, wheelModel, config) {
        this.experience = new Experience()
        this.scene = this.experience.scene        
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        
        this.wheelType = wheelType
        this.config = config
        this.wheels = []

        this.tireMaterial = null
        this.jantesMaterial = null
        
        // Config spécifique au type de roue
        this.wheelConfig = wheelTypeConfigs[wheelType] || { rotationSpeed: 2.0 }

        this.setMaterial(wheelType)
        // console.log(wheelType);
        
        
        this.setWheels(wheelModel)
        
        // Debug
        if(this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder(`Wheels - ${wheelType}`)
            this.setupDebug()
        }
    }
    
    setWheels(wheelModel) {
        const positions = ['frontLeft', 'frontRight', 'backgroundLeft', 'backgroundRight']
        
        positions.forEach((pos, index) => {
            // Clone la roue
            const wheel = wheelModel.scene.clone()
            const cfg = this.config[pos]
            
            // Applique position, rotation, scale
            wheel.position.set(...cfg.position)
            wheel.rotation.set(...cfg.rotation)
            wheel.scale.set(...cfg.scale)
            
            let meshIndex = 0
            
            // Matériaux et ombres
            wheel.traverse(child => {
                if(child instanceof THREE.Mesh) {
                    child.castShadow = true
                    child.receiveShadow = true
                    
                    // Premier mesh = Jante
                    if(meshIndex === 0) {
                        child.material = this.jantesMaterial
                        console.log(`⭕ Jante material appliqué sur ${pos}`)
                    }
                    // Deuxième mesh = Tire
                    else if(meshIndex === 1) {
                        child.material = this.tireMaterial
                        console.log(`🛞 Tire material appliqué sur ${pos}`)
                    }
                    
                    meshIndex++
                }
            })
            
            this.scene.add(wheel)
            this.wheels.push({
                mesh: wheel,
                position: pos,
                baseRotation: cfg.rotation[1]
            })
        })
    }
    
    createTireMaterial() {
        const tireColor = this.resources.items.tireColor
        const tireNormal = this.resources.items.tireNormal
        const tireRoughness = this.resources.items.tireRoughness
        const tireAO = this.resources.items.tireAO
        
        if(tireColor) {
            tireColor.flipY = false
            tireColor.colorSpace = THREE.SRGBColorSpace
        }
        if(tireNormal) {
            tireNormal.flipY = false
            tireNormal.colorSpace = THREE.LinearSRGBColorSpace
        }
        if(tireRoughness) {
            tireRoughness.flipY = false
            tireRoughness.colorSpace = THREE.SRGBColorSpace
        }
        if(tireAO) {
            tireAO.flipY = false
            tireAO.colorSpace = THREE.SRGBColorSpace
        }
        
        this.tireMaterial = new THREE.MeshStandardMaterial({
            map: tireColor,
            roughnessMap: tireRoughness,
            normalMap: tireNormal,
            // aoMap: tireAO
            // metalness: 0.636,
            // roughness: 0.459,
            // normalMap: chassisNormal,
            // emissiveMap: chassisEmissive,
            // emissive: new THREE.Color(0xffffff),
            // emissiveIntensity: 2
        })
        
        console.log('✅ Tire material created')
    }

    createAlphaMaterial() {
        const alphaColor = this.resources.items.alphaColor
        const alphaNormal = this.resources.items.alphaNormal
        
        if(alphaColor) {
            alphaColor.flipY = false
            alphaColor.colorSpace = THREE.SRGBColorSpace
        }
        if(alphaNormal) {
            alphaNormal.flipY = false
            alphaNormal.colorSpace = THREE.SRGBColorSpace
        }

        this.jantesMaterial = new THREE.MeshStandardMaterial({
            map: alphaColor,
            normalMap: alphaNormal,
            // normalScale: 0.1,
            roughness: 0.200,
            metalness: 0.609,        
        })
        console.log("alpha material créé");
    }

    createDieciMaterial() {
        this.jantesMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x000000),
            roughness: 0.250,
            metalness: 0.750,        
        })
        console.log("Dieci material créé");
    }

    createCristianoMaterial() {
        this.jantesMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x000000), 
            roughness: 0.50,               
            metalness: 0.305,        
        })
        console.log("Cristiano material créé");
    }

    setMaterial(wheelType) {
        this.createTireMaterial()

        const materialFunctions = {
            alpha: () => this.createAlphaMaterial(), 
            dieci: () => this.createDieciMaterial(),
            cristiano: () => this.createCristianoMaterial(),
        };

        if (materialFunctions[wheelType]) {
            materialFunctions[wheelType]();
        } else {
            console.error("Type de roue inconnu :", wheelType);
        }
    }
    
    setupDebug() {
        if(!this.debug.active || this.wheels.length === 0) return
        
        // Debug de la première roue (front left)
        const wheel = this.wheels[2].mesh
        
        this.debugFolder
            .add(wheel.position, 'x')
            .name('Wheel X')
            .min(-2).max(2).step(0.01)
            .onChange(val => {
                // Applique symétrie sur frontRight
                this.wheels[1].mesh.position.x = -val
            })
        
        this.debugFolder
            .add(wheel.position, 'y')
            .name('Wheel Y')
            .min(-0.5).max(0.5).step(0.01)
            .onChange(val => {
                this.wheels.forEach(w => w.mesh.position.y = val)
            })
        
        this.debugFolder
            .add(wheel.position, 'z')
            .name('Wheel Z Front')
            .min(-2).max(2).step(0.01)
            .onChange(val => {
                this.wheels[0].mesh.position.z = val
                this.wheels[1].mesh.position.z = val
            })
        
        this.debugFolder
            .add(this.wheels[2].mesh.position, 'z')
            .name('Wheel Z Rear')
            .min(-2).max(2).step(0.01)
            .onChange(val => {
                this.wheels[2].mesh.position.z = val
                this.wheels[3].mesh.position.z = val
            })
        
        this.debugFolder
            .add(wheel.scale, 'x')
            .name('Wheel Scale X')
            .min(0.1).max(3).step(0.01)
            .onChange(val => {
                this.wheels[0].mesh.scale.x = val
                this.wheels[1].mesh.scale.x = val
            })

        this.debugFolder
            .add(wheel.scale, 'y')
            .name('Wheel Scale Y')
            .min(0.1).max(3).step(0.01)
            .onChange(val => {
                this.wheels.forEach(w => w.mesh.scale.y = val)
            })

        this.debugFolder
            .add(wheel.scale, 'z')
            .name('Wheel Scale Z')
            .min(0.1).max(3).step(0.01)
            .onChange(val => {
                this.wheels.forEach(w => w.mesh.scale.z = val)
            })
        
        this.debugFolder
            .add(this.wheelConfig, 'rotationSpeed')
            .name('Rotation Speed')
            .min(0).max(10).step(0.1)
    }
    
    update(deltaTime) {
        // Rotation des roues (simulation roulement)
        // this.wheels.forEach(wheel => {
        //     wheel.mesh.rotation.x += deltaTime * this.wheelConfig.rotationSpeed
        // })
    }
    
    destroy() {
        this.wheels.forEach(wheel => {
            this.scene.remove(wheel.mesh)
            
            // Dispose
            wheel.mesh.traverse(child => {
                if(child instanceof THREE.Mesh) {
                    child.geometry.dispose()
                }
            })
        })

        if(this.tireMaterial) this.tireMaterial.dispose()
        if(this.jantesMaterial) this.jantesMaterial.dispose()
        
        this.wheels = []
        
        if(this.debug.active && this.debugFolder) {
            this.debugFolder.destroy()
        }
    }
}