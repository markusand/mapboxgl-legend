import type {
  Map as MapboxMap,
  Layer as MapboxLayer,
  ExpressionSpecification as Expression,
} from 'mapbox-gl';

export type { MapboxMap, Expression };

export type LabelValue = string | boolean;

export type PropertyMetadata = {
  unit?: string | ((value: unknown) => string);
  labels?: Record<string, LabelValue | ((value: unknown) => LabelValue)>;
};

export type Metadata = {
  name?: string;
  classes?: string[];
  properties?: Record<string, PropertyMetadata>;
} & PropertyMetadata;

export type LayerMetadata = {
  legend?: Metadata;
} & Record<string, unknown>;

export type Layer = {
  metadata?: LayerMetadata;
} & MapboxLayer;

export type LayerOptions = {
  collapsed?: boolean;
  toggler?: boolean | string[];
  attributes?: string[];
  highlight?: boolean;
  onToggle?: (layer: string, visibility: boolean) => void;
} & PropertyMetadata & {
    properties?: Record<string, PropertyMetadata>;
  };

export type LegendControlOptions = {
  minimized?: boolean;
  layers?: (string | RegExp)[] | Record<string, boolean | string[] | LayerOptions>;
} & LayerOptions;

export type ParsedExpression<In, Out> = {
  name: string;
  getter: Expression | undefined;
  stops: [In, Out][];
  inputs: In[];
  outputs: Out[];
  min: number;
  max: number;
};

// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export type Renderer<In = any, Out = any> = (
  expression: ParsedExpression<In, Out>,
  layer: Layer,
  map: MapboxMap,
  options: LayerOptions,
) => HTMLElement | undefined;
