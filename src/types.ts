import type {
  Map as MapboxMap,
  Layer as MapboxLayer,
  ExpressionSpecification as Expression,
} from 'mapbox-gl';

export type { MapboxMap, Expression };

export type Metadata = {
  name?: string;
  unit?: string;
  labels?: Record<string, string | boolean>;
  extraLegendClasses?: string[];
};

export type Layer = {
  metadata?: Metadata;
} & MapboxLayer;

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
  name: string;
  getter: Expression | undefined,
  stops: [In, Out][];
  inputs: In[];
  outputs: Out[];
  min: number;
  max: number;
};
