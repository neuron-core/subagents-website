import { COMPETITORS } from '../../consts/example';
import { listOf, numberWord } from '../format';

/** Copy several demos share: the competitors one by one, and the reply once their research is back. */
export const [FIRST_COMPETITOR, SECOND_COMPETITOR, THIRD_COMPETITOR] = COMPETITORS;

export const REPORTS_IN = `All ${numberWord(COMPETITORS.length)} reports are in. ${FIRST_COMPETITOR} charges per seat, while ${listOf([SECOND_COMPETITOR, THIRD_COMPETITOR])} charge per usage.`;
