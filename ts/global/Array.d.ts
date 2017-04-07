interface Array<T> {
  remove(elem : T) : boolean;
  stableSort(compareFn : (elem1 : T, elem2 : T) => number) : void;
}
