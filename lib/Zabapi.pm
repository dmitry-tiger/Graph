package Zabapi;

use base Zabbix::API;
use Data::Dumper;

sub get_all_hosts() {
	my $self = shift;
	my %hostList;
	my ($key,$value);
	my $params = {
		output => ["host","hostid","status"]
      
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
                $status = $hostListRaw->[$i]->{status};
#		$hostList{$key} .= $value;
                $hostList{$key} = [$value,$status];
                
	}
	return \%hostList;
}

sub get_items_by_hostids
{
        my ($self, $hostids ) = @_;
        my %itemList;
        my ($key,$value,$hostkey,$hostid,$lastvalue,$status);
#        my $groupId = $self->group_id($groupName);
	my @hostids = split(",",$hostids);
        my $params = {
                output => ["name","itemid","key_","hostid","status","lastclock"],
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
                $status = $hostListRaw->[$i]->{status};
                $lastvalue = $hostListRaw->[$i]->{lastclock};
                $itemList{$key}=[$value,$hostkey,$hostid,$status,$lastvalue];
        }
        return \%itemList;
}

sub get_items_by_itemids
{
        my ($self, $itemids ) = @_;
        my %itemList;
        my ($key,$value,$hostkey,$hostid,$status,$lastvalue);
#        my $groupId = $self->group_id($groupName);
	my @itemids = split(",",$itemids);
        my $params = {
                output => ["name","itemid","key_","hostid","status","lastclock"],
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
                $status = $hostListRaw->[$i]->{status};
                $lastvalue = $hostListRaw->[$i]->{lastclock};
                $itemList{$key}=[$value,$hostkey,$hostid,$status,$lastvalue];
        }
        return \%itemList;
}

1;