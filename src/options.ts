export interface VMoneyOptions {
  debug: boolean;
  masked: boolean;
  prefix: string;
  suffix: string;
  thousands: string;
  decimal: string;
  precision: number;
  disableNegative: boolean;
  disabled: boolean;
  min: number | null;
  max: number | null;
  allowBlank: boolean;
  minimumNumberOfCharacters: number;
  modelModifiers: any;
  shouldRound: boolean;

  [key: string]: any;
}

export default {
  debug: false,
  masked: false,
  prefix: '',
  suffix: '',
  thousands: ',',
  decimal: '.',
  precision: 2,
  disableNegative: false,
  disabled: false,
  min: null,
  max: null,
  allowBlank: false,
  minimumNumberOfCharacters: 0,
  modelModifiers: {
    number: false
  },
  shouldRound: true
} as VMoneyOptions;
