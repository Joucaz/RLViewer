// src/Experience/World/CarAnimator.js - Version avec scale mobile
import * as THREE from 'three'
import Experience from '../Experience.js'
import CaptureManager from '../Utils/CaptureManager.js'

export default class CarAnimator {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        
        this.captureManager = new CaptureManager()
        
        // Groupe qui contiendra la voiture ET les roues
        this.vehicleGroup = new THREE.Group()
        this.scene.add(this.vehicleGroup)
        
        // 🆕 📱 AJOUTÉ : Scale mobile du vehicleGroup
        this.isMobile = window.innerWidth <= 768
        this.applyMobileScale()
        
        // 🆕 📱 AJOUTÉ : Écoute resize
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile
            this.isMobile = window.innerWidth <= 768
            
            if (wasMobile !== this.isMobile) {
                this.applyMobileScale()
            }
        })
        
        // Références
        this.car = null
        this.wheels = null
        
        // État de l'animation
        this.isAnimating = false
        this.animationProgress = 0
        
        // Paramètres d'animation
        this.config = {
            duration: 1.5,
            startX: -2,
            endX: 0,
            wheelRadius: 0.13,
            easing: this.easeInOutCubic
        }
        
        this.currentCarType = null
    }
    
    attachVehicle(car, wheels, carType) {
        console.log('🔗 Attaching vehicle to animation group...')
        
        this.currentCarType = carType
        
        this.detachVehicle()
        
        this.car = car
        this.wheels = wheels
        
        if (this.car && this.car.model) {
            if (this.car.model.parent === this.scene) {
                this.scene.remove(this.car.model)
            }
            this.vehicleGroup.add(this.car.model)
            this.car.model.position.set(0, 0, 0)
            console.log('  ✅ Car attached')
        }
        
        if (this.wheels && this.wheels.wheels) {
            let wheelCount = 0
            this.wheels.wheels.forEach(wheel => {
                if (wheel.mesh.parent === this.scene) {
                    this.scene.remove(wheel.mesh)
                }
                this.vehicleGroup.add(wheel.mesh)
                wheelCount++
            })
            console.log(`  ✅ ${wheelCount} wheels attached for ${carType}`)
        }
        
        this.vehicleGroup.position.set(0, 0, 0)
        
        console.log('✅ Vehicle fully attached to animation group')
    }
    
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2
    }
    
    async startEntryAnimation() {
        if (this.isAnimating) {
            console.warn('⚠️ Animation already in progress')
            return
        }
        
        if (!this.car || !this.wheels) {
            console.error('❌ No vehicle attached!')
            return
        }
        
        console.log('🎬 Starting car entry animation...')
        
        this.isAnimating = true
        this.animationProgress = 0
        
        this.vehicleGroup.position.x = this.config.startX
        
        if (this.wheels) {
            this.wheels.wheels.forEach(wheel => {
                wheel.mesh.rotation.z = 0
            })
        }
        
        return new Promise((resolve) => {
            this.animationResolve = resolve
        })
    }
    
    update(deltaTime) {
        if (!this.isAnimating) return
        
        this.animationProgress += deltaTime / this.config.duration
        this.animationProgress = Math.min(this.animationProgress, 1)
        
        const easedProgress = this.config.easing(this.animationProgress)
        
        const currentX = THREE.MathUtils.lerp(
            this.config.startX,
            this.config.endX,
            easedProgress
        )
        
        const previousX = this.vehicleGroup.position.x
        const distance = currentX - previousX
        
        this.vehicleGroup.position.x = currentX
        
        if (this.wheels && distance !== 0) {
            const baseRotation = distance / this.config.wheelRadius
            
            this.wheels.wheels.forEach((wheel, index) => {
                const isFlipped = Math.abs(wheel.mesh.rotation.x) > Math.PI / 2
                const wheelRotation = isFlipped ? -baseRotation : baseRotation
                wheel.mesh.rotation.z -= wheelRotation
            })
        }
        
        if (this.animationProgress >= 1) {
            this.stopAnimation()
        }
    }
    
    stopAnimation() {
        this.isAnimating = false
        this.animationProgress = 0
        
        this.vehicleGroup.position.x = this.config.endX
        
        console.log('✅ Animation completed!')
        
        if (this.animationResolve) {
            this.animationResolve()
            this.animationResolve = null
        }
    }
    
    reset() {
        this.isAnimating = false
        this.animationProgress = 0
        this.vehicleGroup.position.x = this.config.endX
        
        if (this.wheels) {
            this.wheels.wheels.forEach(wheel => {
                wheel.mesh.rotation.z = 0
            })
        }
    }
    
    detachVehicle() {
        if (this.car) {
            this.vehicleGroup.remove(this.car.model)
        }
        
        if (this.wheels) {
            this.wheels.wheels.forEach(wheel => {
                this.vehicleGroup.remove(wheel.mesh)
            })
        }
        
        this.car = null
        this.wheels = null
        
        console.log('✅ Vehicle detached from animation group')
    }
    
    // 🆕 📱 NOUVELLE MÉTHODE AJOUTÉE
    applyMobileScale()
    {
        if (this.isMobile) {
            // 📱 Mode mobile : scale down le vehicleGroup à 70%
            this.vehicleGroup.scale.set(0.5, 0.5, 0.5)
            console.log('📱 Mobile mode: vehicle scaled to 70%')
        } else {
            // 🖥️ Mode desktop : scale normal
            this.vehicleGroup.scale.set(1, 1, 1)
            console.log('🖥️ Desktop mode: vehicle scaled to 100%')
        }
    }
    
    destroy() {
        this.stopAnimation()
        this.detachVehicle()
        this.scene.remove(this.vehicleGroup)
        this.vehicleGroup = null
    }
}