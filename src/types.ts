import type { Map, Layer, Expression, ExpressionName } from 'mapbox-gl';

export type { Map, Layer, Expression, ExpressionName };

export type LayerOptions = {
  collapsed?: boolean;
  toggler?: boolean;
  attributes?: string[];
  onToggle?: (layer: string, visibility: boolean) => void;
};

export type LegendControlOptions = {
  layers?: string[] | Record<string, boolean | string[] | LayerOptions>
} & LayerOptions;

export type ParsedExpression<In, Out> = {
  name: ExpressionName;
  stops: [In, Out][];
  inputs: In[];
  outputs: Out[];
  min: number;
  max: number;
};
