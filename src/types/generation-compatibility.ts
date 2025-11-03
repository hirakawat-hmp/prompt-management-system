/**
 * Service + Model Compatibility Matrix
 *
 * Defines valid combinations of AI services and models to prevent
 * invalid service+model pairings at compile time and runtime.
 */

import type { GenerationService, GenerationModel } from '@prisma/client';

/**
 * Valid service+model combinations as discriminated union
 * This provides compile-time type safety
 */
export type ServiceModelCombination =
  // Kie.ai supported models (MVP)
  | { service: 'KIE'; model: 'IMAGEN4' }
  | { service: 'KIE'; model: 'VEO3' }
  | { service: 'KIE'; model: 'MIDJOURNEY' }
  | { service: 'KIE'; model: 'SORA2' }
  // Google AI supported models (Future)
  | { service: 'GOOGLE'; model: 'IMAGEN4' }
  | { service: 'GOOGLE'; model: 'VEO3' }
  | { service: 'GOOGLE'; model: 'GEMINI_2_0' }
  // Azure OpenAI supported models (Future)
  | { service: 'AZURE'; model: 'DALL_E_3' }
  | { service: 'AZURE'; model: 'GPT_4O' }
  // OpenAI supported models (Future)
  | { service: 'OPENAI'; model: 'DALL_E_3' }
  | { service: 'OPENAI'; model: 'SORA2' }
  | { service: 'OPENAI'; model: 'GPT_4O' };

/**
 * Service to models mapping
 * Used for runtime validation
 */
const SERVICE_MODEL_MAP: Record<GenerationService, GenerationModel[]> = {
  KIE: ['IMAGEN4', 'VEO3', 'MIDJOURNEY', 'SORA2'],
  GOOGLE: ['IMAGEN4', 'VEO3', 'GEMINI_2_0'],
  AZURE: ['DALL_E_3', 'GPT_4O'],
  OPENAI: ['DALL_E_3', 'SORA2', 'GPT_4O'],
};

/**
 * Runtime validation: Check if service+model combination is valid
 *
 * @param service - The AI service provider
 * @param model - The AI model to use
 * @returns true if combination is valid, false otherwise
 *
 * @example
 * isValidServiceModelCombination('KIE', 'IMAGEN4') // true
 * isValidServiceModelCombination('KIE', 'DALL_E_3') // false
 */
export function isValidServiceModelCombination(
  service: GenerationService,
  model: GenerationModel
): boolean {
  return SERVICE_MODEL_MAP[service]?.includes(model) ?? false;
}

/**
 * Get supported models for a given service
 *
 * @param service - The AI service provider
 * @returns Array of supported models
 *
 * @example
 * getSupportedModels('KIE') // ['IMAGEN4', 'VEO3', 'MIDJOURNEY', 'SORA2']
 */
export function getSupportedModels(
  service: GenerationService
): GenerationModel[] {
  return SERVICE_MODEL_MAP[service] || [];
}

/**
 * Get services that support a given model
 *
 * @param model - The AI model
 * @returns Array of services that support this model
 *
 * @example
 * getServicesForModel('IMAGEN4') // ['KIE', 'GOOGLE']
 */
export function getServicesForModel(
  model: GenerationModel
): GenerationService[] {
  return Object.entries(SERVICE_MODEL_MAP)
    .filter(([_, models]) => models.includes(model))
    .map(([service]) => service as GenerationService);
}
