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

        this.setTextureWheels()

        this.setMaterials()
    }

    setTextureWheels()
    {
        this.textures.alphaBake = this.resources.items.alphaBake
        this.textures.alphaBake.colorSpace = THREE.SRGBColorSpace
        this.textures.alphaBake.flipY = false

        this.textures.alphaNormal = this.resources.items.alphaNormal
        this.textures.alphaNormal.colorSpace = THREE.SRGBColorSpace
        this.textures.alphaNormal.flipY = false

        this.textures.alphaRoughness = this.resources.items.alphaRoughness
        this.textures.alphaRoughness.colorSpace = THREE.SRGBColorSpace
        this.textures.alphaRoughness.flipY = false
    }

    setMaterials()
    {
        this.bakedMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.color,
        })

        this.alphaMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.alphaBake,
            normalMap: this.textures.alphaNormal,
            roughnessMap: this.textures.alphaRoughness
        })
    }
}