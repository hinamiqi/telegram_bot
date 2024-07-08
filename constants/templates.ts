import { DASH } from "./constants";

export const getMainMessage = (
    workout: string,
    menu: string,
    menuDescription: string,
    lastWorkout: string,
    lastSet: string
) => `\
*Today workout*
${workout || DASH}

*Last workout*
${lastWorkout || DASH}

*${menu} menu*
_${menuDescription}_
${lastSet}
`;