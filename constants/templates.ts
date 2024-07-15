import { DASH } from "./constants";

export const getMainMessage = (
    workout: string | undefined,
    menu: string,
    menuDescription: string,
    lastWorkout: string | undefined,
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