import type { Map, Layer, Expression, ExpressionName } from 'mapbox-gl';

export type { Map, Layer, Expression, ExpressionName };

export type LayerOptions = {
  collapsed?: boolean;
  toggler?: boolean | string[];
  attributes?: string[];
  highlight?: boolean;
  onToggle?: (layer: string, visibility: boolean) => void;
};

export type LegendControlOptions = {
  minimized?: boolean;
  layers?: (string | RegExp)[] | Record<string, boolean | string[] | LayerOptions>;
} & LayerOptions;

export type ParsedExpression<In, Out> = {
  name: ExpressionName;
  getter: Expression | undefined,
  stops: [In, Out][];
  inputs: In[];
  outputs: Out[];
  min: number;
  max: number;
};
