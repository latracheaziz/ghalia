import { findCollection } from '../content/collections'

/** Resolves a bag line's ids into the labels and image shown to people. */
export function describeItem(item) {
  const collection = findCollection(item.collection)
  return {
    collection,
    format: collection?.formats.find((f) => f.id === item.format),
    filling: collection?.fillings.find((f) => f.id === item.filling),
  }
}
