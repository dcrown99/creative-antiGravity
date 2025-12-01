import { Decimal } from '@prisma/client/runtime/library';

// Decimal型、number型、文字列、またはnull/undefinedを受け入れる型
export type MoneyValue = Decimal | number | string | null | undefined;

export const Calculator = {
  // どんな値も安全にDecimal化
  toDecimal: (value: MoneyValue): Decimal => {
    if (value === null || value === undefined) return new Decimal(0);
    if (value instanceof Decimal) return value;
    try {
      return new Decimal(value);
    } catch {
      console.warn(`Invalid value for Decimal conversion: ${value}`);
      return new Decimal(0);
    }
  },

  // UI/グラフ表示用にnumber化 (小数は維持)
  toNumber: (value: MoneyValue): number => {
    if (value === null || value === undefined) return 0;
    if (value instanceof Decimal) return value.toNumber();
    return Number(value);
  },

  // 加算
  add: (a: MoneyValue, b: MoneyValue): Decimal => {
    return Calculator.toDecimal(a).plus(Calculator.toDecimal(b));
  },

  // 減算
  sub: (a: MoneyValue, b: MoneyValue): Decimal => {
    return Calculator.toDecimal(a).minus(Calculator.toDecimal(b));
  },

  // 乗算
  mul: (a: MoneyValue, b: MoneyValue): Decimal => {
    return Calculator.toDecimal(a).times(Calculator.toDecimal(b));
  },

  // 除算 (ゼロ除算ガード付き)
  div: (a: MoneyValue, b: MoneyValue): Decimal => {
    const decimalB = Calculator.toDecimal(b);
    if (decimalB.isZero()) return new Decimal(0);
    return Calculator.toDecimal(a).div(decimalB);
  }
};
