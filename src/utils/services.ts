import { Service } from '../types';

// Services based on The Barber Mosaic StyleSeat offerings
export const SERVICES: Service[] = [
  // Haircuts
  {
    id: 'haircut-standard',
    name: 'Standard Haircut',
    description: 'Classic haircut with clippers and scissors. Includes consultation and style recommendations.',
    duration: 30,
    price: 35,
    category: 'haircut',
    isActive: true,
  },
  {
    id: 'haircut-premium',
    name: 'Premium Haircut',
    description: 'Full service haircut with hot towel, shampoo, and precision styling.',
    duration: 45,
    price: 50,
    category: 'haircut',
    isActive: true,
  },
  {
    id: 'haircut-design',
    name: 'Haircut with Design',
    description: 'Custom haircut with intricate hair design or pattern of your choice.',
    duration: 60,
    price: 65,
    category: 'specialty',
    isActive: true,
  },
  
  // Beard Services
  {
    id: 'beard-trim',
    name: 'Beard Trim',
    description: 'Shape and trim beard to your desired length and style.',
    duration: 20,
    price: 20,
    category: 'beard',
    isActive: true,
  },
  {
    id: 'beard-lineup',
    name: 'Beard Line-Up',
    description: 'Sharp, clean edges and defined beard lines.',
    duration: 15,
    price: 15,
    category: 'beard',
    isActive: true,
  },
  {
    id: 'beard-full',
    name: 'Full Beard Service',
    description: 'Complete beard grooming with hot towel, oil, trim, and shape.',
    duration: 30,
    price: 35,
    category: 'beard',
    isActive: true,
  },
  
  // Combo Services
  {
    id: 'combo-haircut-beard',
    name: 'Haircut + Beard Trim',
    description: 'Complete look refresh with haircut and beard trim combo.',
    duration: 45,
    price: 50,
    category: 'combo',
    isActive: true,
  },
  {
    id: 'combo-premium',
    name: 'The Full Experience',
    description: 'Premium haircut, full beard service, hot towel, and facial massage.',
    duration: 75,
    price: 85,
    category: 'combo',
    isActive: true,
  },
  
  // Kids
  {
    id: 'kids-haircut',
    name: 'Kids Haircut (12 & Under)',
    description: 'Haircut for children 12 years and younger.',
    duration: 25,
    price: 25,
    category: 'kids',
    isActive: true,
  },
  
  // Specialty
  {
    id: 'lineup-only',
    name: 'Line-Up Only',
    description: 'Quick edge up and hairline cleanup.',
    duration: 15,
    price: 15,
    category: 'specialty',
    isActive: true,
  },
  {
    id: 'head-shave',
    name: 'Head Shave',
    description: 'Smooth head shave with hot towel and moisturizer.',
    duration: 30,
    price: 30,
    category: 'specialty',
    isActive: true,
  },
];

export const getServiceById = (id: string): Service | undefined => {
  return SERVICES.find(service => service.id === id);
};

export const getServicesByCategory = (category: Service['category']): Service[] => {
  return SERVICES.filter(service => service.category === category && service.isActive);
};

export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

