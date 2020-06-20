import {professionsEnGB} from './en_GB';
import {Profession} from '../../../../../api/src/profession/model';

const getProfessions = (): Profession[] => {
  const locale = localStorage['locale'];
  switch (locale) {
    default:
      return professionsEnGB;
  }
};

const getProfessionById = id =>
  getProfessions().filter(profession => profession.id === id)[0];

const getMappedProfessions = () => {
  const map = {};
  getProfessions().forEach(profession => {
    map[profession.id] = profession;
  });
  return map;
};

export {
  getProfessionById,
  getProfessions,
  getMappedProfessions
};
