export const getMainMessage = (
    workout: string,
    menu: string,
    menuDescription: string,
    lastWorkout: string,
    lastSet: string
) => `\
*Today workout*
${workout}

*Last workout*
${lastWorkout}

*${menu}*
_${menuDescription}_

${lastSet}
`;