export class Option<T> {
  private readonly value: T | null;

  constructor(value: T | null) {
    this.value = value;
  }

  public isSome(): boolean {
    return this.value !== null;
  }

  public isNone(): boolean {
    return this.value === null;
  }

  public unwrap(): T {
    if (this.isSome()) {
      return this.value!;
    } else {
      throw new Error("Cannot unwrap None");
    }
  }

  public unwrapOr(defaultValue: T): T {
    if (this.isSome()) {
      return this.value!;
    } else {
      return defaultValue;
    }
  }

  public unwrapOrElse(defaultValue: () => T): T {
    if (this.isSome()) {
      return this.value!;
    } else {
      return defaultValue();
    }
  }

  public unwrapUnchecked(): T {
    return this.value!;
  }

  public map<U>(f: (value: T) => U): Option<U> {
    if (this.isSome()) {
      return new Option(f(this.value!));
    } else {
      return new Option<U>(null);
    }
  }

  public mapOr<U>(defaultValue: U, f: (value: T) => U): U {
    if (this.isSome()) {
      return f(this.value!);
    } else {
      return defaultValue;
    }
  }

  public mapOrElse<U>(defaultValue: () => U, f: (value: T) => U): U {
    if (this.isSome()) {
      return f(this.value!);
    } else {
      return defaultValue();
    }
  }

  public mapUnchecked<U>(f: (value: T) => U): U {
    return f(this.value!);
  }

  public and<U>(other: Option<U>): Option<U> {
    if (this.isSome()) {
      return other;
    } else {
      return new Option<U>(null);
    }
  }

  public andThen<U>(f: (value: T) => Option<U>): Option<U> {
    if (this.isSome()) {
      return f(this.value!);
    } else {
      return new Option<U>(null);
    }
  }

  public then<R>(f: (value: T) => R): Option<R> {
    if (this.isSome()) {
      return new Option(f(this.value!));
    } else {
      return new Option<R>(null);
    }
  }

  public or(other: T): T {
    if (this.isSome()) {
      return this.value!;
    } else {
      return other;
    }
  }

  public orElse<U>(f: () => Option<U>): Option<T | U> {
    if (this.isSome()) {
      return this;
    } else {
      return f();
    }
  }

  public orUnchecked<U>(other: Option<U>): Option<T | U> {
    if (this.isSome()) {
      return this;
    } else {
      return other;
    }
  }

  public zip<U>(other: Option<U>): Option<[T, U]> {
    if (this.isSome() && other.isSome()) {
      return new Option([this.value!, other.value!]);
    } else {
      return new Option<[T, U]>(null);
    }
  }

  public zipWith<U, V>(
    other: Option<U>,
    f: (value: T, other: U) => V
  ): Option<V> {
    if (this.isSome() && other.isSome()) {
      return new Option(f(this.value!, other.value!));
    } else {
      return new Option<V>(null);
    }
  }

  public unzipWith<U, V>(f: (value: T) => [U, V]): [Option<U>, Option<V>] {
    if (this.isSome()) {
      const [u, v] = f(this.value!);
      return [new Option(u), new Option(v)];
    } else {
      return [new Option<U>(null), new Option<V>(null)];
    }
  }

  public when<R>(then: (value: T) => R): Option<R>;
  public when<R>(then: (value: T) => R, otherwise: () => R): Option<R>;
  public when<R>(then: (value: T) => R, otherwise?: () => R): Option<R> {
    if (this.isSome()) {
      return new Option(then(this.value!));
    } else if (otherwise) {
      return new Option(otherwise());
    } else {
      return new Option<R>(null);
    }
  }
}

const none = new Option<any>(null);
export const None = <T>(): Option<T> => none;

export const Some = <T>(value: T | null): Option<T> => {
  if (value === null || value === undefined) {
    return none;
  } else {
    return new Option(value);
  }
};
