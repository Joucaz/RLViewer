import * as THREE from 'three'
import Experience from '../Experience.js'
import Car from './Car.js'
import WheelSet from './WheelSet.js'
import { wheelPositions } from '../configs/wheelPositions.js'

export default class CarsManager {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        
        this.currentCar = null
        this.currentWheels = null
        
        // Sélections par défaut
        this.selectedCarType = 'fennec'
        this.selectedWheelType = 'alpha'
        
        // Debug
        if(this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Vehicle Manager')
            this.setupDebug()
        }
        
        // Setup initial
        this.setupVehicle(this.selectedCarType, this.selectedWheelType)
        
        // Setup UI après que les ressources soient chargées
        this.setupUI()
    }
    
    setupVehicle(carType, wheelType) {
        console.log(`Setting up vehicle: ${carType} with ${wheelType}`)
        
        // Supprime l'ancien véhicule
        if (this.currentCar) {
            this.currentCar.destroy()
            this.currentCar = null
        }
        if (this.currentWheels) {
            this.currentWheels.destroy()
            this.currentWheels = null
        }
        
        // Vérifie que les ressources sont chargées
        if(!this.resources.items[carType]) {
            console.error(`Car model ${carType} not loaded!`)
            return
        }
        if(!this.resources.items[wheelType]) {
            console.error(`Wheel model ${wheelType} not loaded!`)
            return
        }
        
        // Crée la nouvelle voiture
        this.currentCar = new Car(carType, this.resources.items[carType])
        
        // Crée les roues avec la config appropriée
        const wheelConfig = wheelPositions[carType]
        console.log(wheelConfig);
        
        this.currentWheels = new WheelSet(
            wheelType, 
            this.resources.items[wheelType],
            wheelConfig
        )
        
        // Update les boutons UI
        this.updateUIState()
    }
    
    switchCar(carType) {
        if(carType === this.selectedCarType) return
        
        this.selectedCarType = carType
        this.setupVehicle(carType, this.selectedWheelType)
    }
    
    switchWheels(wheelType) {
        if(wheelType === this.selectedWheelType) return
        
        this.selectedWheelType = wheelType
        this.setupVehicle(this.selectedCarType, wheelType)
    }
    
    setupUI() {
        // Boutons pour changer de voiture
        const carButtons = {
            'btn-fennec': 'fennec',
            'btn-octane': 'octane',
            'btn-dominus': 'dominus'
        }
        
        Object.entries(carButtons).forEach(([btnId, carType]) => {
            const btn = document.getElementById(btnId)
            if(btn) {
                btn.addEventListener('click', () => this.switchCar(carType))
            }
        })
        
        // Boutons pour changer de roues
        const wheelButtons = {
            'btn-alpha': 'alpha',
            'btn-cristiano': 'cristiano',
            'btn-dieci': 'dieci'
        }
        
        Object.entries(wheelButtons).forEach(([btnId, wheelType]) => {
            const btn = document.getElementById(btnId)
            if(btn) {
                btn.addEventListener('click', () => this.switchWheels(wheelType))
            }
        })
        
        this.updateUIState()
    }
    
    updateUIState() {
        // Retire la classe 'active' de tous les boutons
        document.querySelectorAll('.car-selector button').forEach(btn => {
            btn.classList.remove('active')
        })
        document.querySelectorAll('.wheel-selector button').forEach(btn => {
            btn.classList.remove('active')
        })
        
        // Ajoute 'active' aux boutons sélectionnés
        const carBtnMap = {
            'fennec': 'btn-fennec',
            'octane': 'btn-octane',
            'dominus': 'btn-dominus'
        }
        const wheelBtnMap = {
            'alpha': 'btn-alpha',
            'cristiano': 'btn-cristiano',
            'dieci': 'btn-dieci'
        }
        
        const activeCarBtn = document.getElementById(carBtnMap[this.selectedCarType])
        if(activeCarBtn) activeCarBtn.classList.add('active')
        
        const activeWheelBtn = document.getElementById(wheelBtnMap[this.selectedWheelType])
        if(activeWheelBtn) activeWheelBtn.classList.add('active')
    }
    
    setupDebug() {
        if(!this.debug.active) return
        
        const debugParams = {
            car: this.selectedCarType,
            wheels: this.selectedWheelType
        }
        
        this.debugFolder
            .add(debugParams, 'car', ['fennec', 'octane', 'dominus'])
            .name('Car Type')
            .onChange(value => this.switchCar(value))
        
        this.debugFolder
            .add(debugParams, 'wheels', ['alpha', 'cristiano', 'dieci'])
            .name('Wheel Type')
            .onChange(value => this.switchWheels(value))
    }
    
    update() {
        if(this.currentCar) {
            this.currentCar.update()
        }
        if(this.currentWheels) {
            this.currentWheels.update(this.experience.time.delta * 0.001)
        }
    }
    
    destroy() {
        if(this.currentCar) this.currentCar.destroy()
        if(this.currentWheels) this.currentWheels.destroy()
        
        if(this.debug.active && this.debugFolder) {
            this.debugFolder.destroy()
        }
    }
}