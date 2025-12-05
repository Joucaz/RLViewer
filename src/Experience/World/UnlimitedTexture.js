import * as THREE from 'three'
import Experience from '../Experience.js'

export default class UnlimitedTexture
{
    constructor()
    {
        
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('UnlimitedTextures')
        }

        this.textures = {}

        // this.setTextureWheels()

        // this.setMaterials()
    }

    setTextureWheels()
    {
        const maxAnisotropy = this.experience.renderer.instance.capabilities.getMaxAnisotropy()

        // Color Map
        this.textures.alphaBake = this.resources.items.alphaBake
        this.textures.alphaBake.colorSpace = THREE.SRGBColorSpace
        this.textures.alphaBake.flipY = false
        this.textures.alphaBake.minFilter = THREE.LinearMipmapLinearFilter  // ✅ Meilleur filtrage
        this.textures.alphaBake.magFilter = THREE.LinearFilter              // ✅ Meilleur agrandissement
        this.textures.alphaBake.anisotropy = 16                             // ✅ Améliore les angles
        this.textures.alphaBake.generateMipmaps = true                      // ✅ Active mipmaps

        // Normal Map
        this.textures.alphaNormal = this.resources.items.alphaNormal
        this.textures.alphaNormal.colorSpace = THREE.LinearSRGBColorSpace   // ✅ IMPORTANT pour normal maps
        this.textures.alphaNormal.flipY = false
        this.textures.alphaNormal.minFilter = THREE.LinearMipmapLinearFilter
        this.textures.alphaNormal.magFilter = THREE.LinearFilter
        this.textures.alphaNormal.anisotropy = 16
        this.textures.alphaNormal.generateMipmaps = true

        // Roughness Map
        this.textures.alphaRoughness = this.resources.items.alphaRoughness
        this.textures.alphaRoughness.colorSpace = THREE.LinearSRGBColorSpace // ✅ IMPORTANT pour roughness
        this.textures.alphaRoughness.flipY = false
        this.textures.alphaRoughness.minFilter = THREE.LinearMipmapLinearFilter
        this.textures.alphaRoughness.magFilter = THREE.LinearFilter
        this.textures.alphaRoughness.anisotropy = 16
        this.textures.alphaRoughness.generateMipmaps = true
    }

    setMaterials()
    {
        this.alphaMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.alphaBake,
            normalMap: this.textures.alphaNormal,
            roughnessMap: this.textures.alphaRoughness
        })
    }
}