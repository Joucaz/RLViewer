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

        this.intensityAmbientLight = 1
        this.intensityAmbientLightOff = 0
        this.intensityDirectionnalLight = 10
        this.intensityDirectionnalLightOff = 0
        
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
        // AMBIENT LIGHT - Éclairage global doux
        // ========================================
        // this.ambientLight = new THREE.AmbientLight(0x404040, 0.6)
        // this.scene.add(this.ambientLight)

        // ========================================
        // KEY LIGHT - Lumière principale
        // ========================================
        // C'est la lumière dominante, la plus intense
        this.keyLight = new THREE.DirectionalLight(0xffffff, 20)
        this.keyLight.position.set(5, 8, 5)
        // this.keyLight.castShadow = true
        
        // Configuration des ombres pour la key light
        // this.keyLight.shadow.mapSize.set(2048, 2048)
        // this.keyLight.shadow.camera.near = 0.5
        // this.keyLight.shadow.camera.far = 50
        // this.keyLight.shadow.camera.left = -10
        // this.keyLight.shadow.camera.right = 10
        // this.keyLight.shadow.camera.top = 10
        // this.keyLight.shadow.camera.bottom = -10
        // this.keyLight.shadow.bias = -0.0001
        
        this.groupLights.add(this.keyLight)

        // ========================================
        // FILL LIGHT - Lumière de remplissage
        // ========================================
        // Adoucit les ombres créées par la key light
        this.fillLight = new THREE.DirectionalLight(0xffffff, 14.4)
        this.fillLight.position.set(-5, 3, -3)
        // Pas d'ombres pour la fill light
        this.groupLights.add(this.fillLight)

        // ========================================
        // RIM/BACK LIGHT - Lumière de contour
        // ========================================
        // Crée un contour lumineux pour détacher l'objet du fond
        this.rimLight = new THREE.DirectionalLight(0xffffff, 14.4)
        this.rimLight.position.set(-3, 4, -8)
        this.groupLights.add(this.rimLight)

        // ========================================
        // ACCENT LIGHTS - Lumières d'accentuation (optionnel)
        // ========================================
        // Spot light pour accentuer certaines zones
        this.spotLight = new THREE.SpotLight(0xffffff, 3)
        this.spotLight.position.set(8, 10, -5)
        this.spotLight.angle = Math.PI / 6
        this.spotLight.penumbra = 0.3
        this.spotLight.decay = 2
        this.spotLight.distance = 30
        this.groupLights.add(this.spotLight)

        // ========================================
        // HEMISPHERE LIGHT - Simulation du ciel (optionnel)
        // ========================================
        // Simule la lumière du ciel et du sol
        this.hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x444444, 0.8)
        this.groupLights.add(this.hemisphereLight)

        // ========================================
        // HELPERS - Pour debug (à retirer en prod)
        // ========================================
        // const keyHelper = new THREE.DirectionalLightHelper(this.keyLight, 1, 0xff0000)
        // this.groupLights.add(keyHelper)
        // const fillHelper = new THREE.DirectionalLightHelper(this.fillLight, 1, 0x00ff00)
        // this.groupLights.add(fillHelper)
        // const rimHelper = new THREE.DirectionalLightHelper(this.rimLight, 1, 0x0000ff)
        // this.groupLights.add(rimHelper)
    }

    setGroup()
    {
        this.groupLights.rotation.set(0,Math.PI, 0)
        this.scene.add(this.groupLights)
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