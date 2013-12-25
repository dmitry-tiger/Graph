package Zabapi;

use base Zabbix::API;
use Data::Dumper;

sub get_all_hosts() {
	my $self = shift;
	my %hostList;
	my ($key,$value);
	my $params = {
		output => ["host","hostid"]
      
	};
#		my $params = {
#		output => ["host","hostid"],
#        	search => {host => $name_pattern},
#	};
	my $hostListRaw = $self->query( method => "host.get", params => $params);
	for ( my $i = 0; $i<@$hostListRaw; $i++ ) 
	{
		$key = $hostListRaw->[$i]->{hostid};
		$value = $hostListRaw->[$i]->{host};
		$hostList{$key} .= $value;
	}
	return \%hostList;
}

sub get_items_by_hostids
{
        my ($self, $hostids ) = @_;
        my %itemList;
        my ($key,$value,$hostkey,$hostid);
#        my $groupId = $self->group_id($groupName);
	my @hostids = split(",",$hostids);
        my $params = {
                output => ["name","itemid","key_","hostid"],
                hostids => \@hostids,
		filter => {flags => [0,4]}
        };
#	print $LOGG  Dumper( $params );
        my $hostListRaw = $self->query( method => "item.get", params => $params);
#	print $LOGG  Dumper( $hostListRaw );
        for ( my $i = 0; $i<@$hostListRaw; $i++ )
        {
                $value = $hostListRaw->[$i]->{name};
                $key = $hostListRaw->[$i]->{itemid};
		$hostkey = $hostListRaw->[$i]->{key_};
		$hostid = $hostListRaw->[$i]->{hostid};
                $itemList{$key}=[$value,$hostkey,$hostid];
        }
        return \%itemList;
}

sub get_items_by_itemids
{
        my ($self, $itemids ) = @_;
        my %itemList;
        my ($key,$value,$hostkey,$hostid);
#        my $groupId = $self->group_id($groupName);
	my @itemids = split(",",$itemids);
        my $params = {
                output => ["name","itemid","key_","hostid"],
                itemids => \@itemids,
		filter => {flags => [0,4]}
        };
#	print $LOGG  Dumper( $params );
        my $hostListRaw = $self->query( method => "item.get", params => $params);
#	print $LOGG  Dumper( $hostListRaw );
        for ( my $i = 0; $i<@$hostListRaw; $i++ )
        {
                $value = $hostListRaw->[$i]->{name};
                $key = $hostListRaw->[$i]->{itemid};
		$hostkey = $hostListRaw->[$i]->{key_};
		$hostid = $hostListRaw->[$i]->{hostid};
                $itemList{$key}=[$value,$hostkey,$hostid];
        }
        return \%itemList;
}

1;