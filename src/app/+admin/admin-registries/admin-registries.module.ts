import { NgModule } from '@angular/core';
import { MetadataRegistryComponent } from './metadata-registry/metadata-registry.component';
import { AdminRegistriesRoutingModule } from './admin-registries-routing.module';
import { CommonModule } from '@angular/common';
import { MetadataSchemaComponent } from './metadata-schema/metadata-schema.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BitstreamFormatsComponent } from './bitstream-formats/bitstream-formats.component';
import { SharedModule } from '../../shared/shared.module';
import { MetadataSchemaFormComponent } from './metadata-registry/metadata-schema-form/metadata-schema-form.component';
import {MetadataFieldFormComponent} from './metadata-schema/metadata-field-form/metadata-field-form.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    TranslateModule,
    AdminRegistriesRoutingModule
  ],
  declarations: [
    MetadataRegistryComponent,
    MetadataSchemaComponent,
    BitstreamFormatsComponent,
    MetadataSchemaFormComponent,
    MetadataFieldFormComponent
  ],
  entryComponents: [

  ]
})
export class AdminRegistriesModule {

}
