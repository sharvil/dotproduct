type ListenerCallback = (listener : Listener, eventData? : any) => void;

export default class Listener {
  public static add(target : any, event : any, callback : ListenerCallback) {
    if (!target.__listener) {
      target.__listener = new Map<any, Array<ListenerCallback>>();
    }

    const array = target.__listener.get(event);
    if (!array) {
      target.__listener.set(event, [callback]);
    } else {
      array.push(callback);
    }
  }

  public static remove(target : any, event : any, callback : ListenerCallback) {
    if (!target.__listener) {
      return;
    }

    const array = <Array<ListenerCallback>> target.__listener.get(event);
    if (array) {
      array.remove(callback);
    }
  }

  public static fire(target : any, event : any, eventData? : any) {
    if (!target.__listener) {
      return;
    }

    const array = target.__listener.get(event);
    if (!array) {
      return;
    }

    for (let i = 0; i < array.length; ++i) {
      array[i](target, eventData);
    }
  }
}
