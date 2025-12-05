import * as THREE from 'three'
import Experience from '../Experience.js'
import CarCustomizer from './CarCustomizer.js'

export default class Car {
    constructor(carType, carModel) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.debug = this.experience.debug
        
        this.carType = carType
        this.model = null
        this.customizer = null
        
        this.setModel(carModel)
        
        // ✅ Crée le customizer qui va appliquer les matériaux
        this.customizer = new CarCustomizer(carType, this.model)
        
        if(this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder(`Car - ${carType}`)
            this.setupDebug()
        }
    }
    
    setModel(carModel) {
        this.model = carModel.scene
        this.scene.add(this.model)
    }
    
    setFinish(finishType) {
        if(this.customizer) {
            this.customizer.setFinish(finishType)
        }
    }
    
    setPaintColor(color) {
        if(this.customizer) {
            this.customizer.setPaintColor(color)
        }
    }
    
    setExtraColor(color) {
        if(this.customizer) {
            this.customizer.setExtraColor(color)
        }
    }
    
    loadUserTexture(file) {
        if(this.customizer) {
            this.customizer.loadUserTexture(file)
        }
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
        // Animations
    }
    
    destroy() {
        if(this.customizer) {
            this.customizer.destroy()
        }
        
        if(this.model) {
            this.scene.remove(this.model)
            
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