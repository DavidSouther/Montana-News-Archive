import {
  makeRecordId
} from '../../shared/record/record';

import {
  default as RecordModule,
  Record,
  RecordResource
} from './record/record-resource';

import {
  RecordViewer
} from './record/record-component';

import {
  Searchbar
} from './searchbar/searchbar-component';

export class Archive {
  public saving: boolean = false;
  public searching: boolean = false;
  public search: string = '';

  public records: Record[] = [];
  public pre: Record[] = [];
  public current: Record = null;
  public currentIndex: number = -1;
  public post: Record[] = [];

  public editing: Record = null;

  public error: any = null;
  constructor(
    private $q: ng.IQService,
    private RecordResource: RecordResource
  ) {
    this.RecordResource.query().$promise.then((__: Record[]) => {
      this.records = __.map((_: Record) => (_.id = makeRecordId(_.label), _));
      this.select(null);
    });
  }

  select(record: Record): void {
    this.currentIndex = this.records.indexOf(record);
    if (this.currentIndex === -1) {
      // Unsetting the current element
      this.current = null;
      this.pre = this.records;
      this.post = [];
    } else {
      this.current = record;
      this.pre = this.records.slice(0, this.currentIndex);
      this.post = this.records.slice(this.currentIndex + 1);
    }
  }

  edit(record: Record): void {
    let success = () => this.editing = record;
    let error = (err: any) => this.error = err;
    let done = () => this.saving = false;
    if (this.editing && record !== this.editing) {
      this.saving = true;
      this.$q.all(
        this.records.map((_: Record) => {
          _.id = makeRecordId(_.label);
          return _;
        }).map((_: Record) => _.$save())
      )
      .then(success, error)
      .then(done, done);
    } else {
      success();
    }
  }

  addTape(): void {
    let record = new this.RecordResource({
      id: '',
      label: '',
      family: '',
      stories: []
    });
    this.records.push(record);
    this.edit(record);
  }

  static directive(): angular.IDirective {
    return {
      controller: Archive,
      controllerAs: 'state',
      bindToController: true,
      scope: {},
      templateUrl: '/mtna/archive-template.html'
    };
  }

  static $inject: string[] = ['$q', 'RecordResource'];
  static $depends: string[] = [
    RecordModule.name,
    RecordViewer.module.name,
    Searchbar.module.name,
    'ngMaterial'
  ];
  static module: angular.IModule = angular.module(
    'mtna.archive', Archive.$depends
  ).directive('archive', Archive.directive);
}