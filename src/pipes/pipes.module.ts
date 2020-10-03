import { SortFilterDatePipe, LookupValueFormatter } from './search-filter/search-filter';

/* Copyright (C) Abbvie Inc - All Rights Reserved
* Unauthorized copying of this file, via any medium is strictly prohibited
* Proprietary and confidential
*/

/*
ModuleID: PipesModule
Description: Package all pipes in a single module to be included in App
Location: ./pipes
Author: Hassan
Version: 1.0.0
Modification history: none
*/


import { SortFilterPipe, LookupSortFilterPipe } from './search-filter/search-filter';
import { NgModule } from '@angular/core';
import { WhatsappdateformatterPipe } from './whatsappdateformatter/whatsappdateformatter';
import { SearchFilterPipe } from './search-filter/search-filter';
import { RfdateformatPipe } from './rfdateformat/rfdateformat';
import { Rfdateformat2Pipe, Rfdateformat3Pipe } from './rfdateformat2/rfdateformat2';
import { KeysPipe } from './keys/keys';
import { FilterbystatusPipe } from './filterbystatus/filterbystatus';
import { FiltersubmittedbyPipe } from './filtersubmittedby/filtersubmittedby';
import { DecodeUriComponentPipe } from './decode-uri-component/decode-uri-component';
import { DecodeUriComponentSinglePipe} from './decode-uri-component/decode-uri-component';
import { ProcessOffsetPipe } from './process-offset/process-offset';
import { LookupSearchPipe } from './lookup-search/lookup-search';


@NgModule({
	declarations: [WhatsappdateformatterPipe,
    SearchFilterPipe,
    RfdateformatPipe,
    Rfdateformat2Pipe,
    Rfdateformat3Pipe,
    KeysPipe,
    LookupSortFilterPipe,
    FilterbystatusPipe,
    FiltersubmittedbyPipe,
    DecodeUriComponentPipe,
    DecodeUriComponentSinglePipe,
    ProcessOffsetPipe,
    SortFilterPipe,
    SortFilterDatePipe,
    LookupValueFormatter,
    LookupSearchPipe],
	imports: [],
	exports: [WhatsappdateformatterPipe,
    SearchFilterPipe,
    RfdateformatPipe,
    Rfdateformat2Pipe,
    Rfdateformat3Pipe,
    KeysPipe,
    FilterbystatusPipe,
    FiltersubmittedbyPipe,
    DecodeUriComponentPipe,
    DecodeUriComponentSinglePipe,
    ProcessOffsetPipe,
    LookupSortFilterPipe,
    SortFilterPipe,
    SortFilterDatePipe,
    LookupValueFormatter,
    LookupSearchPipe]
})
export class PipesModule {}
