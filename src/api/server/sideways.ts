export function sideways(...actions: Promise<unknown>[]) {
    return Promise.all(actions)
  }