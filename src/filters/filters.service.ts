import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FiltersService {
  logger: Logger = new Logger('FiltersService');

  applyFilter(filter: string, message: string): string {
    let firstClean = message;
    const [regex, replace] = filter.split('>>>');
    const regexObj = new RegExp(regex, 'g');

    firstClean = firstClean.replace(regexObj, replace);

    return firstClean;
  }

  cleanConcordiaMessage(message: string): string {
    let result = message;
    // Erase 'cmd=&msg='
    result = result.replace('cmd=&msg=', '');
    return result;
  }

  cleanVoicebotMessage(filters: string[], message: string): string {
    let result = message;
    const globalFilters = process.env.GLOBAL_FILTERS.split('|') || null;
    if (globalFilters) {
      globalFilters.forEach((filter) => {
        result = this.applyFilter(filter, result);
      });
    }

    if (process.env.NUMBER_CONDENSING_ENABLED === 'true') {
      const asrBugRegex = /\d\s\d/;
      const numberOrSpaceRegex = /\d|\s/;
      const spaceRegex = /\s/;
      const notNumberRegex = /\D/;
      const match = asrBugRegex.exec(result);
      if (match) {
        this.logger.verbose(
          `match found at ${match.index} char:${result[match.index]}`,
        );
        let firstCursor = match.index;
        while (numberOrSpaceRegex.exec(result[firstCursor])) {
          firstCursor -= 1;
        }
        this.logger.verbose(
          `First cursor stopped at ${firstCursor}, char : ${result[firstCursor]}`,
        );
        let secondCursor = firstCursor + 1;
        while (spaceRegex.exec(result[secondCursor])) {
          secondCursor += 1;
        }
        this.logger.verbose(
          `Second cursor stopped at ${secondCursor}, char : ${result[secondCursor]}`,
        );

        let thirdCursor = secondCursor;

        while (numberOrSpaceRegex.exec(result[thirdCursor])) {
          thirdCursor += 1;
        }
        this.logger.verbose(
          `Third cursor stopped at ${thirdCursor}, char : ${result[thirdCursor]}`,
        );

        let fourthCursor =
          result[thirdCursor] === undefined ? thirdCursor - 1 : thirdCursor;
        while (notNumberRegex.exec(result[fourthCursor])) {
          fourthCursor -= 1;
        }
        this.logger.verbose(
          `Fourth cursor stopped at ${fourthCursor}, char : ${result[fourthCursor]}`,
        );

        const toBeCondensed = result.substring(secondCursor, fourthCursor + 1);
        const condensed = toBeCondensed.replace(/\s/g, '');
        this.logger.verbose(`Condensed ${toBeCondensed} to ${condensed}`);

        const beforeString = result.substring(0, secondCursor);
        const afterString = result.substring(fourthCursor + 1);

        result = beforeString + condensed + afterString;

        this.logger.verbose(`Final message: ${result}`);
      }
    }
    // si hay un con, borramos los centavos
    const conRegex = /\d\scon\s\d/g;
    const conReplacementRegex = /\scon\s/g;
    const centavoReplacementRegex = /(centavos?)||(sentados?)/g;
    if (result.match(conRegex)) {
      // borramos centavo o centavos
      result = result.replace(centavoReplacementRegex, '');
      // reemplazamos el con por coma
      result = result.replace(conReplacementRegex, '.');
      this.logger.warn(`Replaced 'con' with '.' : ${message} => ${result}`);
    }
    filters.forEach((filter) => (result = this.applyFilter(filter, result)));
    this.logger.verbose(`Cleaned message: ${result}`);
    return result;
  }
}
