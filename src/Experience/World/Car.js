import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Car {

    constructor(carType, carModel) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.debug = this.experience.debug
        
        this.carType = carType
        this.model = null
        
        this.setModel(carModel)
        
        // Debug
        if(this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder(`Car - ${carType}`)
            this.setupDebug()
        }
    }
    
    setModel(carModel) {
        // Clone le modèle pour pouvoir en créer plusieurs instances
        this.model = carModel.scene
        
        // Position de base de la voiture
        // this.model.position.set(0, 0, 0)
        
        // Applique les matériaux si nécessaire
        this.model.traverse(child => {
            if(child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
                
                // Si tu as un matériau custom
                // if (child.material) {
                //     child.material = this.experience.world.customMaterial
                // }
            }
        })
        
        this.scene.add(this.model)
    }
    
    setupDebug() {
        if(!this.debug.active) return
        
        this.debugFolder
            .add(this.model.position, 'x')
            .name('Position X')
            .min(-5).max(5).step(0.01)
        
        this.debugFolder
            .add(this.model.position, 'y')
            .name('Position Y')
            .min(-5).max(5).step(0.01)
        
        this.debugFolder
            .add(this.model.position, 'z')
            .name('Position Z')
            .min(-5).max(5).step(0.01)
        
        this.debugFolder
            .add(this.model.rotation, 'y')
            .name('Rotation Y')
            .min(-Math.PI).max(Math.PI).step(0.01)
    }
    
    update() {
        // Animations de la voiture si nécessaire
        // Par exemple : légère rotation pour preview
    }
    
    destroy() {
        if(this.model) {
            this.scene.remove(this.model)
            
            // Dispose geometry et materials
            this.model.traverse(child => {
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
        }
        
        if(this.debug.active && this.debugFolder) {
            this.debugFolder.destroy()
        }
    }
}