import * as THREE from 'three'
import Experience from './Experience.js'

export default class Renderer
{
    constructor()
    {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.debug = this.experience.debug

        // Debug
        if(this.debug.active)
        {
            this.rendererFolder = this.debug.ui.addFolder('Renderer')
        }

        this.setInstance()
    }

    setInstance()
    {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance',
            alpha: true
        })
        
        const maxAnisotropy = this.instance.capabilities.getMaxAnisotropy()
        console.log('Max Anisotropy:', maxAnisotropy)

        this.instance.toneMapping = THREE.CineonToneMapping
        this.instance.toneMappingExposure = 1.0
        // this.instance.shadowMap.enabled = true
        // this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        this.instance.setClearColor('#000000', 0)
        
        // Output encoding (important pour l'env map)
        this.instance.outputColorSpace = THREE.SRGBColorSpace
        
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))

        // Debug
        if(this.debug.active)
        {
            const toneMappingOptions = {
                'No': THREE.NoToneMapping,
                'Linear': THREE.LinearToneMapping,
                'Reinhard': THREE.ReinhardToneMapping,
                'Cineon': THREE.CineonToneMapping,
                'ACESFilmic': THREE.ACESFilmicToneMapping
            }
            
            this.rendererFolder
                .add(this.instance, 'toneMapping', toneMappingOptions)
                .name('Tone Mapping')
            
            this.rendererFolder
                .add(this.instance, 'toneMappingExposure')
                .name('Exposure')
                .min(0)
                .max(3)
                .step(0.01)
            
            this.rendererFolder
                .add(this.instance.shadowMap, 'enabled')
                .name('Shadows')
        }
    }

    resize()
    {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
    }

    update()
    {    
        this.instance.render(this.scene, this.camera.instance)
    }
}