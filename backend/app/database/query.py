from sqlalchemy.orm import Query as BaseQuery

class SoftDeleteQuery(BaseQuery):
    def get(self, ident):
        # Override get to filter out soft deleted records
        obj = super(SoftDeleteQuery, self).get(ident)
        if obj is None:
            return None
        return obj if obj.deleted_at is None else None

    def __iter__(self):
        # Filter out soft deleted records
        return filter(lambda obj: obj.deleted_at is None, super(SoftDeleteQuery, self).__iter__())

    def from_self(self, *ent):
        # Filter out soft deleted records
        return self.enable_assertions(False).filter(self.model.deleted_at == None)

    def _get(self, ident):
        # Filter out soft deleted records
        return super(SoftDeleteQuery, self)._get(ident)
