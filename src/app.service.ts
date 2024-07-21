import { Injectable, Scope, Type } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { Module } from '@nestjs/core/injector/module';
import { STATIC_CONTEXT } from '@nestjs/core/injector/constants';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { flatMap, get } from 'lodash';

import { DiscoveredClass } from './discovery.types';

@Injectable()
export class AppService {
  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner,
  ) {
    const modulesMap = [...this.modulesContainer.entries()];

    console.log('Modules Map: ', modulesMap);

    const discoveredControllers = Promise.all(
      flatMap(modulesMap, ([key, nestModule]) => {
        const module: Module = nestModule;
        console.log('controller key ', key);
        console.log('nestModule ', module);
        console.log('----- ------ ------ ------ -----');

        const components = nestModule.routes
          ? [...nestModule.routes.values()]
          : [];
        return components
          .filter((component) => component.scope !== Scope.REQUEST)
          .map((component) => this.toDiscoveredClass(nestModule, component));
      }),
    );
    console.log('Discovered Controllers: ', discoveredControllers);

    // const discoveredProviders = Promise.all(
    //   flatMap(modulesMap, ([key, nestModule]) => {
    //     console.log('provider key ', key);

    //     const components = nestModule.components
    //       ? [...nestModule.components.values()]
    //       : [];
    //     return components
    //       .filter((component) => component.scope !== Scope.REQUEST)
    //       .map((component) => this.toDiscoveredClass(nestModule, component));
    //   }),
    // );
    // console.log('Discovered providers: ', discoveredProviders);
  }

  private async toDiscoveredClass(
    nestModule: Module,
    wrapper: InstanceWrapper<any>,
  ): Promise<DiscoveredClass> {
    const instanceHost = wrapper.getInstanceByContextId(
      STATIC_CONTEXT,
      wrapper && wrapper.id ? wrapper.id : undefined,
    );

    if (instanceHost.isPending && !instanceHost.isResolved) {
      await instanceHost.donePromise;
    }

    return {
      name: wrapper.name as string,
      instance: instanceHost.instance,
      injectType: wrapper.metatype as never,
      dependencyType: get(instanceHost, 'instance.constructor'),
      parentModule: {
        name: nestModule.metatype.name,
        instance: nestModule.instance,
        injectType: nestModule.metatype,
        dependencyType: nestModule.instance.constructor as Type<any>,
      },
    };
  }

  getHello(): string {
    return 'Hello World!';
  }
}
