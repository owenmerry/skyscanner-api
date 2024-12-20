import { Injectable } from '@nestjs/common';
import { EntryCollection, EntrySkeletonType } from 'contentful';

@Injectable()
export class ContentService {
  searchWithWildcard(urlWithWildCard: string, url: string) {
    let w = urlWithWildCard.replace(/[.+^${}()|[\]\\]/g, '\\$&'); // regexp escape
    const re = new RegExp(
      `^${w.replace(/\*/g, '.*').replace(/\?/g, '.')}$`,
      'i',
    );
    return re.test(url); // remove last 'i' above to have case sensitive
  }

  orderEntries(entries: EntryCollection<EntrySkeletonType, undefined, string>) {
    const entriesSorted = entries.items.sort(
      (a, b) => String(b.fields?.slug)?.length - String(a.fields?.slug)?.length,
    );
    return {
      ...entries,
      items: entriesSorted,
    };
  }

  filterEntries(
    entries: EntryCollection<EntrySkeletonType, undefined, string>,
    url: string,
  ) {
    const entriesFiltered = entries.items.filter((entry) => {
      const slug = entry.fields?.slug;
      if (!slug || typeof slug !== 'string') return false;

      return this.searchWithWildcard(slug, url);
    });

    return {
      ...entries,
      items: entriesFiltered,
    };
  }
}
