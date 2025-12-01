import * as THREE from 'three'
import Experience from '../Experience.js'
import { wheelTypeConfigs } from '../configs/wheelPositions.js'

export default class WheelSet {
    constructor(wheelType, wheelModel, config) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.debug = this.experience.debug
        
        this.wheelType = wheelType
        this.config = config
        this.wheels = []
        
        // Config spécifique au type de roue
        this.wheelConfig = wheelTypeConfigs[wheelType] || { rotationSpeed: 2.0 }
        
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
            
            // Matériaux et ombres
            wheel.traverse(child => {
                if(child instanceof THREE.Mesh) {
                    child.castShadow = true
                    child.receiveShadow = true

                    if(this.wheelType === 'alpha' && this.experience.world.unlimitedTexture) {
                        // child.material = this.experience.world.unlimitedTexture.alphaMaterial
                    }
                    // Pour les autres types de roues, garde le matériau par défaut
                    // ou ajoute d'autres conditions ici plus tard
                }
            })
            
            this.scene.add(wheel)
            this.wheels.push({
                mesh: wheel,
                position: pos,
                baseRotation: cfg.rotation[1] // Stocke la rotation Y de base
            })
        })
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
                    
                    if(child.material) {
                        if(Array.isArray(child.material)) {
                            child.material.forEach(mat => mat.dispose())
                        } else {
                            child.material.dispose()
                        }
                    }
                }
            })
        })
        
        this.wheels = []
        
        if(this.debug.active && this.debugFolder) {
            this.debugFolder.destroy()
        }
    }
}