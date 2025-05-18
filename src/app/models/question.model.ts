import { Country } from './country.model';

export interface Question {
  options: Country[];
  correct: Country;
  flagUrl: string;
}