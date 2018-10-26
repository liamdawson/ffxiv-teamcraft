import { AbstractExtractor } from './abstract-extractor';
import { CraftedBy } from '../../model/crafted-by';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { HtmlToolsService } from '../../../../core/tools/html-tools.service';
import { Item } from '../../../../model/garland-tools/item';

export class CraftedByExtractor extends AbstractExtractor<CraftedBy[]> {

  constructor(protected gt: GarlandToolsService, private htmlTools: HtmlToolsService) {
    super(gt);
  }

  public isAsync(): boolean {
    return false;
  }

  public getDataType(): DataType {
    return DataType.CRAFTED_BY;
  }

  protected canExtract(item: Item): boolean {
    return item.isCraft();
  }

  protected doExtract(item: Item, itemData: ItemData): CraftedBy[] {
    const result = [];
    for (const craft of item.craft) {
      const craftedBy: CraftedBy = {
        itemId: item.id,
        icon: `https://secure.xivdb.com/img/classes/set2/${this.gt.getJob(craft.job).name.toLowerCase()}.png`,
        level: craft.lvl,
        stars_tooltip: this.htmlTools.generateStars(craft.stars),
        recipeId: craft.id
      };
      if (craft.job === 0) {
        craftedBy.icon = '';
      }
      if (craft.unlockId !== undefined) {
        const masterbookPartial = itemData.getPartial(craft.unlockId.toString(), 'item');
        if (masterbookPartial !== undefined) {
          craftedBy.masterbook = {
            icon: masterbookPartial.obj.c,
            id: craft.unlockId
          };
        }
      }
      result.push(craftedBy);
    }
    return result;
  }

}