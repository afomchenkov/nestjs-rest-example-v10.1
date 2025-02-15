import { Type } from '@nestjs/common';

export interface DiscoveredModule {
  name: string;
  instance: any;
  injectType?: Type<any>;
  dependencyType: Type<any>;
}

export interface DiscoveredClass extends DiscoveredModule {
  parentModule: DiscoveredModule;
}

export interface DiscoveredMethod {
  handler: (...args: any[]) => any;
  methodName: string;
  parentClass: DiscoveredClass;
}

export interface DiscoveredMethodWithMeta<T> {
  discoveredMethod: DiscoveredMethod;
  meta: T;
}

export interface DiscoveredClassWithMeta<T> {
  discoveredClass: DiscoveredClass;
  meta: T;
}

export type MetaKey = string | number | symbol;

export type Filter<T> = (item: T) => boolean;
