import GqlData from "../gql_data";

const userProfiles = () : GqlData => {
  return {
    query: `query userProfiles 
      {
        userProfiles {
          profiles {
            profileId visitorId type name avatar url
          }
        }
      }`,
    variables: {}
  }
};

const addProfile = (name: string, profileType: string, avatar: string): GqlData => {
  return {
    query: `mutation userProfileAdd($name: String! $type: String! $avatar: String!)
      {
        userProfileAdd(name: $name, type: $type, avatar: $avatar) {
          profiles {
            profileId visitorId type name avatar url
          }
        }
      }`,
    variables: { name, type: profileType, avatar }
  }
};

const updateProfile = (profileId: number, name: string, avatar: string): GqlData => {
  return {
    query: `mutation userProfileUpdate($profileId: Int! $name: String! $avatar: String!)
      {
        userProfileUpdate(profileId: $profileId, name: $name, avatar: $avatar) {
          profiles {
            profileId visitorId type name avatar url
          }
      }
    }`,
    variables: { profileId, name, avatar }
  }
};

const deleteProfile = (profileId: number): GqlData => {
  return {
    query: `mutation userProfileDelete($profileId: Int!)
      {
        userProfileDelete(profileId: $profileId) {
          profiles {
            profileId visitorId type name avatar url
          }
      }
    }`,
    variables: { profileId }
  }
};

export { userProfiles, addProfile, updateProfile, deleteProfile }