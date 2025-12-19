import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Environment
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        this.debugObject = {}

        // 🆕 Stockage des intensités de BASE de chaque light
        this.baseLightIntensities = {
            keyLight: 20,
            fillLight: 14.4,
            rimLight: 14.4,
            spotLight: 3,
            hemisphereLight: 0.8
        }
        
        // 🆕 Multiplicateur global (1 = 100% des valeurs de base)
        this.lightMultiplier = 1.0
        
        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('environment')
        }
        this.groupLights = new THREE.Group()

        this.setLights()
        this.setGroup()
        
        this.setEnvironmentMap()
    }

    setLights()
    {
        // ========================================
        // KEY LIGHT - Lumière principale
        // ========================================
        this.keyLight = new THREE.DirectionalLight(0xffffff, this.baseLightIntensities.keyLight)
        this.keyLight.position.set(5, 8, 5)
        this.groupLights.add(this.keyLight)

        // ========================================
        // FILL LIGHT - Lumière de remplissage
        // ========================================
        this.fillLight = new THREE.DirectionalLight(0xffffff, this.baseLightIntensities.fillLight)
        this.fillLight.position.set(-5, 3, -3)
        this.groupLights.add(this.fillLight)

        // ========================================
        // RIM/BACK LIGHT - Lumière de contour
        // ========================================
        this.rimLight = new THREE.DirectionalLight(0xffffff, this.baseLightIntensities.rimLight)
        this.rimLight.position.set(-3, 4, -8)
        this.groupLights.add(this.rimLight)

        // ========================================
        // SPOT LIGHT - Lumière d'accentuation
        // ========================================
        this.spotLight = new THREE.SpotLight(0xffffff, this.baseLightIntensities.spotLight)
        this.spotLight.position.set(8, 10, -5)
        this.spotLight.angle = Math.PI / 6
        this.spotLight.penumbra = 0.3
        this.spotLight.decay = 2
        this.spotLight.distance = 30
        this.groupLights.add(this.spotLight)

        // ========================================
        // HEMISPHERE LIGHT - Simulation du ciel
        // ========================================
        this.hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x444444, this.baseLightIntensities.hemisphereLight)
        this.groupLights.add(this.hemisphereLight)
    }

    setGroup()
    {
        this.groupLights.rotation.set(0, Math.PI, 0)
        this.scene.add(this.groupLights)
    }

    // 🆕 Méthode pour mettre à jour toutes les lights avec le multiplicateur
    setLightMultiplier(multiplier)
    {
        this.lightMultiplier = multiplier
        
        // Applique le multiplicateur à chaque light
        this.keyLight.intensity = this.baseLightIntensities.keyLight * multiplier
        this.fillLight.intensity = this.baseLightIntensities.fillLight * multiplier
        this.rimLight.intensity = this.baseLightIntensities.rimLight * multiplier
        this.spotLight.intensity = this.baseLightIntensities.spotLight * multiplier
        this.hemisphereLight.intensity = this.baseLightIntensities.hemisphereLight * multiplier
        
        console.log(`💡 Light multiplier set to ${multiplier}`)
    }

    // 🆕 Getter pour récupérer le multiplicateur actuel
    getLightMultiplier()
    {
        return this.lightMultiplier
    }

    setEnvironmentMap()
    {
        this.environmentMap = {}
        this.environmentMap.intensity = 0.8
        this.environmentMap.texture = this.resources.items.environmentMapTexture
        this.environmentMap.texture.colorSpace = THREE.SRGBColorSpace
        
        this.scene.environment = this.environmentMap.texture

        this.environmentMap.updateMaterials = () =>
        {
            this.scene.traverse((child) =>
            {
                if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
                {
                    child.material.envMap = this.environmentMap.texture
                    child.material.envMapIntensity = this.environmentMap.intensity
                    child.material.needsUpdate = true
                }
            })
        }
        this.environmentMap.updateMaterials()

        // Debug
        if(this.debug.active)
        {
            this.debugFolder
                .add(this.environmentMap, 'intensity')
                .name('envMapIntensity')
                .min(0)
                .max(4)
                .step(0.001)
                .onChange(this.environmentMap.updateMaterials)
        }
    }

    update()
    {
         
    }
}