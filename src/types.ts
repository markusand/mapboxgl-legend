import type {
  Map as MapboxMap,
  Layer as MapboxLayer,
  ExpressionSpecification as Expression,
} from 'mapbox-gl';

export type { MapboxMap, Expression };

export type LabelValue = string | boolean;
export type Resolvable<T> = T | ((value: unknown) => T);

export type PropertyMetadata = {
  prefix?: Resolvable<string>;
  unit?: Resolvable<string>;
  labels?: Record<string, Resolvable<LabelValue>> | Resolvable<LabelValue>;
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

export type OnToggle = (layer: string, visibility: boolean) => void;

export type LayerOptions = {
  collapsed?: boolean;
  toggler?: boolean | string[];
  attributes?: string[];
  highlight?: boolean;
  onToggle?: OnToggle;
  properties?: Record<string, PropertyMetadata>;
} & PropertyMetadata;

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
  options: LayerOptions,
  map: MapboxMap,
) => HTMLElement | undefined;
