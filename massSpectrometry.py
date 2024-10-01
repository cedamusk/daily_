import math
import random

class Ion:
    def __init__(self, mass, charge):
        self.mass = mass
        self.charge = charge
        self.velocity = 0
        self.position = 0

class MassSpectrometer:
    def __init__(self, acceleration_voltage, magnetic_field_strength):
        self.acceleration_voltage = acceleration_voltage
        self.magnetic_field_strength = magnetic_field_strength

    def ionize(self, molecule_mass):
        """Simulate ionization process"""
        charge = random.choice([1, 2, 3])  # Randomly assign charge
        return Ion(molecule_mass, charge)

    def accelerate(self, ion):
        """Accelerate ion through electric field"""
        kinetic_energy = self.acceleration_voltage * ion.charge
        ion.velocity = math.sqrt(2 * kinetic_energy / ion.mass)

    def deflect(self, ion):
        """Calculate radius of curvature in magnetic field"""
        radius = (ion.mass * ion.velocity) / (ion.charge * self.magnetic_field_strength)
        return radius

    def detect(self, ion, radius):
        """Simulate detection based on radius of curvature"""
        detection_position = round(radius, 2)
        return detection_position

    def analyze_sample(self, sample):
        results = {}
        for molecule_mass in sample:
            ion = self.ionize(molecule_mass)
            self.accelerate(ion)
            radius = self.deflect(ion)
            detection_position = self.detect(ion, radius)
            results[detection_position] = molecule_mass
        return results

# Example usage
spectrometer = MassSpectrometer(acceleration_voltage=5000, magnetic_field_strength=0.5)
sample = [18, 28, 32, 44]  # Masses of some common molecules (H2O, N2, O2, CO2)
results = spectrometer.analyze_sample(sample)

print("Mass Spectrometer Results:")
for position, mass in sorted(results.items()):
    print(f"Detection position: {position} m, Molecule mass: {mass} u")